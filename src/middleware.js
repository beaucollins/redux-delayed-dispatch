export default ( { getState, dispatch } ) => next => action => {
	return next( action );
};
