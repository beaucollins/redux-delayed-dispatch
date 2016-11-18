# Redux Delayed Dispatch

Delayed Dispatch is setTimeout/clearTimeout but in middleware form with some small enhancements.

## Install and setup

1. `npm install redux-delayed-dispatch`
2. Add the store enhancer using `applyMiddleware`:

Example:

```javascript
// import middleware
import delayedDispatch from 'redux-delayed-dispatch';

// use middleware in your store
createStore( reducer, applyMiddleware( delayedDispatch ) );
```

## Using

For basic actions where the keys and values of the redux action or primitives (excluding `object`, `array`, and `function` )

```javascript
import { delayAction, cancelAction } from 'redux-delayed-dispatch';

const myAction = ( param ) => ( { type: 'ACTION_TYPE', param } );

// delays myAction for 100 ms
const identifier = dispatch( delayAction( myAction, 100 ) );
if ( shouldCancelTimer ) {
	// myAction will not be dispatched
	dispatch( cancelAction( identifier ) );
}
```