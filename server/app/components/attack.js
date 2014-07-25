'use strict';

var _ = require('lodash')
    , utils = require('../../../shared/utils')
    , ComponentBase = require('../../../shared/components/attack')
    , Body = require('../../../shared/physics/body')
    , AttackComponent;

/**
 * Attack component class.
 * @class server.components.AttackComponent
 * @classdesc Component that adds the ability to attack other entities.
 * @extends shared.components.AttackComponent
 */
AttackComponent = utils.inherit(ComponentBase, {
    /**
     * Creates a new component.
     * @constructor
     */
    constructor: function() {
        ComponentBase.apply(this);

        // internal properties
        this._team = null;
        this._body = null;
        this._physics = null;
        this._lastAttackAt = null;
    }
    /**
     * @override
     */
    , init: function() {
        var io = this.owner.components.get('io');
        io.spark.on('entity.attack', this.onAttack.bind(this));

        this._team = this.owner.attrs.get('team');
        this._body = new Body('attack', this.owner);
        this._physics = this.owner.components.get('physics');
    }
    /**
     * Event handler for when the entity is attacking.
     * @method server.components.AttackComponent#onAttack
     */
    , onAttack: function() {
        if (this.canAttack()) {
            var now = _.now()
                , target = this.calculateTarget()
                , aoe = this.owner.attrs.get('attackAoe')
                , halfAoe = aoe / 2
                , amount = 0
                , otherTeam;

            this._body.x = target.x - halfAoe;
            this._body.y = target.y - halfAoe;
            this._body.width = aoe;
            this._body.height = aoe;

            this._physics.overlap('player', function(body, other) {
                otherTeam = other.owner.attrs.get('team');

                console.log(this._team, otherTeam);

                // make sure that we are not hitting our teammates
                if (!_.isUndefined(otherTeam) && this._team !== otherTeam && other.owner.attrs.get('alive')) {
                    amount = this.calculateDamage();
                    other.owner.damage(amount, this.owner);
                    console.log('   player %s hit opponent %s for %d', body.owner.id, other.owner.id, amount);
                }
            }, this, this._body/* use the attack body instead of the entity body */);

            this._lastAttackAt = now;
        }
    }
    /**
     * Calculates the amount of damage done.
     * @method server.components.AttackComponent#calculateDamage
     * @return {number} Amount of damage.
     */
    , calculateDamage: function() {
        // TODO implement some logic for missing and critical hits
        return this.owner.attrs.get('maxDamage');
    }
});

module.exports = AttackComponent;
