const express = require('express');
const router = express.Router();
const AppSchema = require('../model/appModel');
router.post('/create', (req, res) => {
    const newApp = new AppSchema({
        name: req.body.name,
    });
    newApp.save()
        .then(newApp => res.json(newApp))
        .catch(err => console.error(err));
});
router.post('/getapps', (req, res) => {
     AppSchema.find({}, (err, apps) => {
        if(err){
            console.log(err)
            res.json({ success: false, msg: "Error: " + err });
        } else if(!apps) {
            res.json({ success: false, msg: "No apps found" });
        } else {
            res.json({ success: true, apps: apps });
        }
     });
  });
router.get('/:id', async (req, res) => {
    const app = await AppSchema.findById(req.params.id);
    res.json(app);
});
router.delete('/:id', async (req, res) => {
    await AppSchema.findByIdAndDelete(req.params.id);
    res.json({ message: 'App Deleted' });
});
router.put('/:id', async (req, res) => {
    const { name } = req.body;
    const newApp = { name };
    console.log("New App", newApp);
    try {
        let updatedApp = await AppSchema.findOneAndUpdate({
            "_id": ObjectId(req.
                params.id)
        }, { $set: newApp }, { new: true });
        res.json(updatedApp);
    }
    catch (err) {
        console.log(err);
    }
});
module.exports = router;
