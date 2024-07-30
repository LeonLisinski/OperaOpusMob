import { useSelector } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';

export { PrivateRoute };

function PrivateRoute({ component: Component, ...rest }) {
    const user = useSelector((state) => {
        return state.auth?.user;
    });



    return (
        <Route {...rest} render={props => {
            if (!user) {
                // not logged in so redirect to login page with the return url
                //return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
                return <Redirect to={{ pathname: '/login' }} />
            }

            // authorized so return component
            return <Component {...props} />
        }} />
    );
}