'use strict';
let mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true
  },
  issueTitle: {
    type: String,
    required: true
  },
  issueText: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true
  },
  assignedTo: String,
  open: {
    type: Boolean,
    default: true
  },
  statusText: String,
  createdOn: {
    type: Date,
    default: new Date()
  },
  updatedOn: {
    type: Date,
    default: new Date()
  }
});

let Issue = mongoose.model('Issue', issueSchema);

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      const {_id, issue_title, issue_text, assigned_to, created_by, status_text, open} = req.query
      let query = {projectName: project}
      if(_id) query._id = _id
      if(issue_title) query.issueTitle = issue_title
      if(issue_text) query.issueText = issue_text
      if(assigned_to) query.assignedTo = assigned_to
      if(created_by) query.createdBy = created_by
      if(status_text) query.statusText = status_text
      if(open) query.open = open
      console.log('query: ', query);
      Issue.find(query, function(err, data){
        if(err) return console.log(err);
        const dataParsed = data.map(obj => {
          return {
            _id: obj._id,
            issue_title: obj.issueTitle,
            issue_text: obj.issueText,
            created_by: obj.createdBy,
            assigned_to: obj.assignedTo,
            status_text: obj.statusText,
            open: obj.open,
            created_on: obj.createdOn,
            updated_on: obj.updatedOn
          }
        })
        res.json(dataParsed);
      });
    })
    
    .post(function (req, res){
      let project = req.params.project;
      const {issue_title, issue_text, created_by, assigned_to, status_text} = req.body
      console.log(issue_title, issue_text, created_by, assigned_to, status_text)
      if(!issue_title || !issue_text || !created_by){
        res.json({ error: 'required field(s) missing' });
      }else{
        var issue = new Issue({
          projectName: project, 
          issueTitle: issue_title, 
          issueText: issue_text,
          createdBy: created_by,
          assignedTo: !assigned_to ? '' : assigned_to,
          statusText: !status_text ? '' : status_text
        })

        issue.save(function(err, data){
          if(err) return console.log(err);
          res.json({
            _id: data._id,
            issue_title: data.issueTitle,
            issue_text: data.issueText,
            created_on: data.createdOn,
            created_by: data.createdBy,
            updated_on: data.updatedOn,
            assigned_to: data.assignedTo,
            open: data.open,
            status_text: data.statusText
          })
        })
      }
    })
    
    .put(function (req, res){
      let project = req.params.project;
      const {_id, issue_title, issue_text, assigned_to, created_by, status_text, open} = req.body;
      console.log('passed in id: ', _id)
      if(!_id){
        res.json({error: 'missing _id'})
      }
      else if(!issue_title && !issue_text && !assigned_to && !created_by && !status_text && !open){
        res.json({ error: 'no update field(s) sent', '_id': _id })
      }
      else{
        Issue.findByIdAndUpdate(_id, 
          {
            issueTitle: issue_title,
            issueText: issue_text,
            assignedTo: assigned_to,
            createdBy: created_by,
            statusText: status_text,
            open: open,
            updatedOn: new Date()
          },
          function(err, data){
            console.log(data)
            if(err){
              res.json({ error: 'could not update', '_id': _id })
            }else if(!data){
              res.json({ error: 'could not update', '_id': _id })
            }
            else{
              res.json({ result: 'successfully updated', '_id': _id })
            }
          }
        )
      }
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      const _id = req.body._id
      if(!_id){
        res.json({ error: 'missing _id' })
      }else{
        Issue.findByIdAndRemove(_id, function(err, data){
          if(err) {
            res.json({ error: 'could not delete', _id: _id });
            console.log(err)
          }
          if(!data){
            res.json({ error: 'could not delete', _id: _id })
          }else{
            res.json({ result: 'successfully deleted', _id: _id });
          }
        })
      }
    })
    
};
