const validation = require('../../../core/utils/validation');
const Collection = require('../models/collection.model');
const { emitCrudEvent } = require('../../eventTriggers/services/event-trigger.service');

function normalize(v=''){ return String(v).trim(); }

exports.create = async (req,res)=>{
  try{
    const name = normalize(req.body.name);
    const key = normalize(req.body.key);
    const tableName = normalize(req.body.tableName);

    const exists = await Collection.findOne({ where:{ key }});
    if(exists) return res.status(400).json({ success:false, message:'exists' });

    const item = await Collection.create({ name,key,tableName });

    emitCrudEvent({ module:'collections', action:'created', recordId:item.id });

    res.json({ success:true, collection:item });

  }catch(e){
    res.status(500).json({ success:false, message:e.message });
  }
};
