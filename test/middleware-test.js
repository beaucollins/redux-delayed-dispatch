/**
 * External Dependencies
 */
import { ok, equal } from 'assert';
import { createStore, applyMiddleware } from 'redux';
import { assoc, dissoc } from 'ramda';
/**
 * Internal dependencies
 */
import middleware, { delayAction, cancelAction } from '../src/middleware';

const reducer = ( state = {}, action ) => {
	switch ( action.type ) {
		case 'SET':
			return assoc( action.key, action.value, state );
		case 'DELETE':
			return dissoc( action.key, state );
	}
	return state;
};

const set = ( key, value ) => ( { type: 'SET', key, value } );
const remove = ( key ) => ( { type: 'DELETE', key } );

const setup = state => createStore( reducer, state, applyMiddleware( middleware ) );

describe( 'delayed dispatch', () => {
	let store;

	beforeEach( () => store = setup() );

	it( 'should dispatch after specified time', done => {
		const { dispatch, getState } = store;
		const { id } = dispatch( delayAction( set( 'name', 'second' ), 0 ) );
		dispatch( set( 'name', 'first' ) );

		equal( getState().name, 'first' );
		equal( id, 'key:name;type:SET;value:second' );

		setTimeout( () => {
			equal( getState().name, 'second' );
			done();
		}, 0 );
	} );

	it( 'should clear timer', done => {
		const { dispatch, getState } = store;
		dispatch( set( 'name', 'furiousa' ) );
		const { id, cancel } = dispatch( delayAction( remove( 'name' ), 2 ) );
		dispatch( cancel );
		ok( id );

		setTimeout( () => {
			ok( getState().name );
			done();
		}, 5 );
	} );

	it( 'should cancel action based on identifier', done => {
		const { dispatch, getState } = store;
		dispatch( set( 'name', 'furiosa' ) );
		dispatch( delayAction( remove( 'name' ), 2 ) );
		dispatch( cancelAction( remove( 'name' ) ) );

		setTimeout( () => {
			ok( getState().name );
			done();
		}, 5 );
	} );
} );
