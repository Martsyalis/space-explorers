const request = require('./request');
const assert = require('chai').assert;
const db = require('./db');
const resolveEvent = require('../../lib/gameFunction/resolveEvent');


describe.only('resolveEvent function', ()=>{
    beforeEach( ()=> db.drop());

    let savedEnvironment = null;
    let savedEnemy = null;
    let savedEvent = null;
    let testEvent = null;
    let savedChar= null;

    const ship ={
        name: 'Moya',
        hp: 1000,
        dmg: 100,
        description: 'A living sentient bio-mechanical space ship.',
        class: 'Leviathan'
    };

    const char ={
        name: 'Ford Prefect',
        description: 'human/alien travel writer',
        user:'590643bc2cd3da2808b0e651',
        ship: ship
    };
    
    const enemy = {
        name: 'Advanced Cylon War Raider Battalion',
        damage: 25,
        healthPoints: 55,
    };

    const environment = {
        name: 'Astroid Field',
        dmg: 25,
        description: 'The asteroid belt is the circumstellar disc in the Solar System located roughly between the orbits of the planets Mars and Jupiter. It is occupied by numerous irregularly shaped bodies called asteroids or minor planets.',
        globalDmg: 15
    };


    beforeEach( () => {

        return Promise.all([
            request.post('/api/enemies')
                .send(enemy)
                .then(res => savedEnemy = res.body),
            request.post('/api/spaceEnvs')
                .send(environment)
                .then(res => savedEnvironment = res.body)
        ])
            .then(() => {
                testEvent = {
                    scenario: 'You have encountered an Advanced Cylon War Raider Battalion inside of an astroid field!',
                    spaceEnv: savedEnvironment._id,
                    enemy: savedEnemy._id,
                    actions: [
                        {
                            option: 'Attack',
                            difficulty: 3,
                            success: {
                                description: 'You have decided to engage the Advanced Cylon War Raider squad, Your point defences cut each squadron in turn, sustaining minimal damage',
                                outcome: 0
                            },
                            failure: {
                                description: 'You have decided to engage the Advanced Cylon War Raider squad. Your point defense system was overwhelmed by the swarming raiders and your ship sustained heavy damage',
                                outcome: -40
                            }
                        },

                        {
                            option: 'Diplomacy',
                            difficulty: 0,
                            success: {
                                description: 'You have decided to negotiate with the Advanced Cylon War Raider squad. Surprisingly they decided to bury the hatchet of war and become friends. Apparently all that was needed was a little human/robot kindness.',
                                outcome: 0
                            },

                            failure: {
                                description: 'not gonna happen',
                                outcome: 1
                            }
                        },
                        {
                            option: 'Run',
                            difficulty: 6,
                            success: {
                                description: 'You have decided to try and outrun the Advanced Cylon War Raider squad. Your swift ship leaves the squad in the dust',
                                outcome: 0
                            },
                            failure: {
                                description: 'You have decided to outrun the Advanced Cylon War Raider squad. Unfortunately fast and nimble raiders manage to inflict significant damage before your ship manages to jump away',
                                outcome: -40
                            }
                        }]
                };
                return request.post('/api/events')
                    .send(testEvent)
                    .then(got => {
                        savedEvent = got.body;
                    });
            });
    });

    beforeEach( () => {
        return request.post('/api/characters')
            .send(char)
            .then( ({body}) => savedChar = body );
    });


    it('checks if function has access to current charecter and the event', ()=>{
        console.log('here are the ids:',savedChar._id, savedEvent._id);
        resolveEvent(savedChar._id, savedEvent._id)
            .then( () => assert.ok(savedChar._id));
    });

});