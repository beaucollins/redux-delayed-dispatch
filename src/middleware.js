const DELAYED_ACTION_TYPE = '@@delayed-dispatch/DELAYED_ACTION';
const DELAYED_ACTION_CANCEL_ACTION_TYPE = '@@delayed-dispatch/CANCEL_ACTION';
const DELAYED_ACTION_CANCEL_TIMER_TYPE = '@@delayed-dispatch/CANCEL_TIMER';
const DELAYED_ACTION_SET_TIMER_TYPE = '@@delayed-dispatch/SET_TIMER';

const identifyAction = action => Object.keys( action ).sort().reduce( ( identifier, key ) => {
	return identifier.concat( `${ key }:${ action[ key ] }` );
}, [] ).join( ';' );

const IMMEDIATE = -1;

export const delayAction = ( action, milliseconds = IMMEDIATE, identifier = undefined ) => {
	if ( identifier === undefined && typeof( action ) === 'object' ) {
		identifier = identifyAction;
	}
	if ( typeof( identifier ) === 'function' ) {
		identifier = identifier( action );
	}
	return {
		type: DELAYED_ACTION_TYPE, milliseconds, identifier, action
	};
};

export const cancelAction = identifier => ( {
	type: DELAYED_ACTION_CANCEL_ACTION_TYPE, identifier
} );

const cancelTimer = id => ( {
	type: DELAYED_ACTION_CANCEL_TIMER_TYPE, id
} );

const addTimer = ( identifier, timer ) => ( {
	type: DELAYED_ACTION_SET_TIMER_TYPE, identifier, timer
} );

const timers = {};

export default ( { dispatch } ) => next => action => {
	switch ( action.type ) {
		case DELAYED_ACTION_CANCEL_TIMER_TYPE:
			clearTimeout( action.id );
			return;
		case DELAYED_ACTION_SET_TIMER_TYPE:
			timers[ action.identifier ] = action.timer;
			return;
		case DELAYED_ACTION_CANCEL_ACTION_TYPE:
			clearTimeout( timers[ action.identifier ] );
			delete timers[ action.identifier ];
			return;
		case DELAYED_ACTION_TYPE:
			if ( ! action.identifier ) {
				// If there is no identifier, and the delay is IMMEDIATE,
				// just dispatch the action
				if ( action.milliseconds === IMMEDIATE ) {
					return dispatch( action.action );
				}
				// if there is no identifier, the action is being dispatched without
				// the chance of cancelation, so set the timer and be done
				// there is also no existing timer to clear
				const id = setTimeout( () => {
					dispatch( action.action );
				}, action.milliseconds );
				return { id, cancel: cancelTimer( id ) };
			}
			// clear the timer for the associated action
			dispatch( cancelAction( action.identifier ) );
			if ( action.milliseconds === IMMEDIATE ) {
				return dispatch( action.action );
			}
			// setup the timer with the given delay
			dispatch( addTimer( action.identifier, setTimeout( () => {
				// clear out the existing timer
				delete timers[ action.identifier ];
				dispatch( action.action );
			} ), action.milliseconds ) );
			return { id: action.identifier, cancel: cancelAction( action.identifier ) };
	}
	return next( action );
};
