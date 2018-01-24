'use strict';

process.env.NODE_ENV = 'testing-mysql';

const _ = require('lodash');
const Promise = require('bluebird');
const models = require('../_database1/models');
const testUtils = require('../utils');
const ObjectId = require('bson-objectid');

let generatePost = function generatePost() {
    let base = {
        title: Math.random().toString(36).substring(2),
        mobiledoc: Array(65537).join('x'),
        html: Array(65537).join('x'),
        plaintext: Array(65537).join('x'),
        a: Math.random().toString(36).substring(2),
        b: Math.random().toString(36).substring(2),
        c: Math.random().toString(36).substring(2),
        d: Math.random().toString(36).substring(2),
        e: Math.random().toString(36).substring(2),
        f: Math.random().toString(36).substring(2),
        g: Math.random().toString(36).substring(2),
        h: Math.random().toString(36).substring(2),
        i: Math.random().toString(36).substring(2),
        j: Math.random().toString(36).substring(2),
        tags: [
            {
                slug: Math.random().toString(36).substring(2),
                meta: [],
                nested: []
            },
            {
                slug: Math.random().toString(36).substring(2),
                meta: [],
                nested: []
            },
            {
                slug: Math.random().toString(36).substring(2),
                meta: [],
                nested: []
            },
            {
                slug: Math.random().toString(36).substring(2),
                meta: [],
                nested: []
            },
            {
                slug: Math.random().toString(36).substring(2),
                meta: [],
                nested: []
            }
        ],
        authors: [
            {
                name: Math.random().toString(36).substring(2)
            },
            {
                name: Math.random().toString(36).substring(2)
            }
        ],
        meta: []
    };

    _.each(_.range(50), function (i) {
        base.meta.push({
            key: Math.random().toString(36).substring(2),
            value: Math.random().toString(36).substring(2)
        })
    });

    _.each(base.tags, function (tag, j) {
        _.each(_.range(20), function (i) {
            base.tags[j].meta.push({
                key: Math.random().toString(36).substring(2),
                value: Math.random().toString(36).substring(2)
            });
        });

        _.each(_.range(5), function (i) {
            base.tags[j].nested.push({
                slug: Math.random().toString(36).substring(2)
            });
        });
    });

    return base;
};

// This describes adds data.
describe.skip('[Integration] Perf (1) - MySQL only - insert', function () {
    this.timeout(1000 * 60 * 50);
    let addedPosts = [];

    before(function () {
        return testUtils.database.reset({dbName: '_database1'})
            .then(function () {
                return testUtils.database.init({dbName: '_database1'});
            });
    });

    it('insert posts', function b() {
        return Promise.map(_.range(5000), function a() {
            let toAdd = generatePost();
            return models.Post.add(toAdd)
                .then(function c(post) {
                    if (addedPosts.length === 0) {
                        addedPosts.push(post);
                    }
                })
        }, {concurrency: 50});
    });

    it.skip('fetch one posts with all relations', function () {
        return models.Post.forge({id: addedPosts[0].id}).fetch({withRelated: ['tags', 'authors', 'meta', 'tags.meta', 'tags.nested']})
            .then(function (post) {
                post.related('tags').length.should.eql(5);
                post.related('tags').models[0].related('meta').length.should.eql(20);
                post.related('tags').models[0].related('nested').length.should.eql(5);
                post.related('authors').length.should.eql(2);
                post.related('meta').length.should.eql(50);
            });
    });
});

// This describes fetches the data. It's annoying to repeat a test and you have to wait 10minutes for the inserts.
describe.only('[Integration] Perf (1) - MySQL only - fetch', function () {
    this.timeout(1000 * 60 * 50);
    this.slow(1);

    // just lookup any post id
    const postId = '5a665f1f9c4f7665dec9fec6';

    before(function () {
        const knex = require('knex');
        const config = require('../../config');
        let conn = knex(config.get('database'));
        return models.init(conn);
    });

    it('fetch one posts with all relations', function () {
        return models.Post.forge({id: postId}).fetch({withRelated: ['tags', 'authors', 'meta', 'tags.meta', 'tags.nested']})
            .then(function (post) {
                post.related('tags').length.should.eql(5);
                post.related('authors').length.should.eql(2);
                post.related('meta').length.should.eql(50);

                //var fs = require('fs');
                //fs.writeFileSync('./lala.json', JSON.stringify(post.toJSON()), 'utf-8');
            });
    });

    it('fetch 15 posts', function () {
        return models.Post.query(function (qb) {
            qb.limit(15);
        }).fetchAll({withRelated: ['tags', 'authors', 'meta', 'tags.meta', 'tags.nested']})
            .then(function (result) {
                result.models.length.should.eql(15);
            });
    });

    it('fetch 15 posts', function () {
        return models.Post.query(function (qb) {
            qb.limit(15);
        }).fetchAll({withRelated: ['tags', 'authors', 'meta', 'tags.meta', 'tags.nested']})
            .then(function (result) {
                result.models.length.should.eql(15);
            });
    });

    it('fetch 15 posts', function () {
        return models.Post.query(function (qb) {
            qb.limit(15);
            qb.offset(2000);
        }).fetchAll({withRelated: ['tags', 'authors', 'meta', 'tags.meta', 'tags.nested']})
            .then(function (result) {
                result.models.length.should.eql(15);
            });
    });

    it('fetch 15 posts', function () {
        return models.Post.query(function (qb) {
            qb.limit(15);
            qb.offset(2000);
        }).fetchAll({withRelated: ['tags', 'authors', 'meta', 'tags.meta', 'tags.nested']})
            .then(function (result) {
                result.models.length.should.eql(15);
            });
    });

    it('fetch 1000 posts with all relations', function () {
        return models.Post.query(function (qb) {
            qb.limit(1000);
        }).fetchAll({withRelated: ['tags', 'authors', 'meta', 'tags.meta', 'tags.nested']})
            .then(function (result) {
                result.models[1].related('tags').length.should.eql(5);
                result.models[1].related('authors').length.should.eql(2);
                result.models[1].related('meta').length.should.eql(50);
            });
    });

    it('edit and expect revisions', function () {
        return models.Post.edit({
            tags: [],
            authors: [
                {
                    name: 'Ralf'
                }
            ],
            id: postId
        }).then(function (post) {
            post.related('tags').models.length.should.eql(0);
            post.related('authors').models.length.should.eql(1);

            return models.Post.forge({id: postId}).fetch({withRelated: ['revisions']});
        }).then(function (result) {
            result.related('revisions').models.length.should.eql(1);
        });
    });
});