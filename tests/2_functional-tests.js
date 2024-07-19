const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let testId;

suite('Functional Tests', function() {
    this.timeout(5000);
    test('Create an issue with every field', function(done){
        chai
            .request(server)
            .keepOpen()
            .post('/api/issues/test')
            .send({
                issue_title: 'test title',
                issue_text: 'test description',
                created_by: 'bdiddy',
                assigned_to: 'bdiddy',
                status_text: 'pending',
            })
            .end(function(err, res){
                assert.equal(res.status, 200)
                assert.equal(res.type, 'application/json')
                assert.equal(res.body.issue_title, 'test title')
                assert.equal(res.body.issue_text, 'test description')
                assert.equal(res.body.created_by, 'bdiddy')
                assert.equal(res.body.assigned_to, 'bdiddy')
                assert.equal(res.body.status_text, 'pending')
                done()
            });
    });

    test('Create an issue with only required fields', function(done){
        chai
            .request(server)
            .keepOpen()
            .post('/api/issues/test')
            .send({
                issue_title: 'test2',
                issue_text: 'test description 2',
                created_by: 'bdiddy'
            })
            .end(function(err, res){
                assert.equal(res.status, 200)
                assert.equal(res.type, 'application/json')
                assert.equal(res.body.issue_title, 'test2')
                assert.equal(res.body.issue_text, 'test description 2')
                assert.equal(res.body.created_by, 'bdiddy')
                assert.equal(res.body.assigned_to, '')
                assert.equal(res.body.status_text, '')
                testId = res.body._id
                done()
            });
    });

    test('Create an issue with missing required fields', function(done){
        chai
            .request(server)
            .keepOpen()
            .post('/api/issues/test')
            .send({
                issue_title: 'test2',
                created_by: 'bdiddy'
            })
            .end(function(err, res){
                assert.equal(res.status, 200)
                assert.equal(res.type, 'application/json')
                assert.equal(res.body.error, 'required field(s) missing')
                done()
            });
    });

    test('View issues on a project', function(done){
        chai
            .request(server)
            .keepOpen()
            .get('/api/issues/test')
            .end(function(err, res){
                assert.equal(res.status, 200)
                assert.equal(res.type, 'application/json')
                assert.isArray(res.body)
                done()
            });
    });

    test('View issues on a project with one filter', function(done){
        chai
            .request(server)
            .keepOpen()
            .get('/api/issues/test?issue_title=test2')
            .end(function(err, res){
                assert.equal(res.status, 200)
                assert.equal(res.type, 'application/json')
                assert.isArray(res.body)
                assert.equal(res.body[0].issue_title, 'test2')
                done()
            });
    });

    test('View issues on a project with multiple filters', function(done){
        chai
            .request(server)
            .keepOpen()
            .get('/api/issues/test?issue_title=test title&created_by=bdiddy')
            .end(function(err, res){
                assert.equal(res.status, 200)
                assert.equal(res.type, 'application/json')
                assert.isArray(res.body)
                assert.equal(res.body[0].issue_title, 'test title')
                assert.equal(res.body[0].created_by, 'bdiddy')
                done()
            });
    });

    test('Update one field on an issue', function(done){
        chai
            .request(server)
            .keepOpen()
            .put('/api/issues/test')
            .send({
                _id: testId,
                issue_title: 'test2 updated'
            })
            .end(function(err, res){
                assert.equal(res.status, 200)
                assert.equal(res.type, 'application/json')
                assert.equal(res.body._id, testId)
                assert.equal(res.body.result, 'successfully updated')
                done()
            });
    });

    test('Update multiple fields on an issue', function(done){
        chai
            .request(server)
            .keepOpen()
            .put('/api/issues/test')
            .send({
                _id: testId,
                issue_title: 'test2 v2',
                issue_text: 'this is a new description',
                open: false
            })
            .end(function(err, res){
                assert.equal(res.status, 200)
                assert.equal(res.type, 'application/json')
                assert.equal(res.body._id, testId)
                assert.equal(res.body.result, 'successfully updated')
                done()
            });
    });

    test('Update an issue with missing _id', function(done){
        chai
            .request(server)
            .keepOpen()
            .put('/api/issues/test')
            .end(function(err, res){
                assert.equal(res.status, 200)
                assert.equal(res.type, 'application/json')
                assert.equal(res.body.error, 'missing _id')
                done()
            });
    });

    test('Update an issue with no fields to update', function(done){
        chai
            .request(server)
            .keepOpen()
            .put('/api/issues/test')
            .send({
                _id: testId
            })
            .end(function(err, res){
                assert.equal(res.status, 200)
                assert.equal(res.type, 'application/json')
                assert.equal(res.body._id, testId)
                assert.equal(res.body.error, 'no update field(s) sent')
                done()
            });
    });

    test('Update an issue with an invalid _id', function(done){
        chai
            .request(server)
            .keepOpen()
            .put('/api/issues/test')
            .send({
                _id: '55555555555555555',
                issue_title: 'test2 v2'
            })
            .end(function(err, res){
                assert.equal(res.status, 200)
                assert.equal(res.type, 'application/json')
                assert.equal(res.body._id, '55555555555555555')
                assert.equal(res.body.error, 'could not update')
                done()
            });
    });

    test('Delete an issue', function(done){
        chai
            .request(server)
            .keepOpen()
            .delete('/api/issues/test')
            .send({
                _id: testId
            })
            .end(function(err, res){
                assert.equal(res.status, 200)
                assert.equal(res.type, 'application/json')
                assert.equal(res.body._id, testId)
                assert.equal(res.body.result, 'successfully deleted')
                done()
            });
    });

    test('Delete an issue with an invalid _id', function(done){
        chai
            .request(server)
            .keepOpen()
            .delete('/api/issues/test')
            .send({
                _id: testId
            })
            .end(function(err, res){
                assert.equal(res.status, 200)
                assert.equal(res.type, 'application/json')
                assert.equal(res.body._id, testId)
                assert.equal(res.body.error, 'could not delete')
                done()
            });
    });

    test('Delete an issue with missing _id', function(done){
        chai
            .request(server)
            .keepOpen()
            .delete('/api/issues/test')
            .end(function(err, res){
                assert.equal(res.status, 200)
                assert.equal(res.type, 'application/json')
                assert.equal(res.body.error, 'missing _id')
                done()
            });
    })
});
