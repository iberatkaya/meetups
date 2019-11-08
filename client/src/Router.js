import React from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
    Link
  } from 'react-router-dom'
import MainPage from './MainPage';  
import CreatePage from './CreatePage';
import HelpPage from './HelpPage';

class RouterPage extends React.Component{

    render(){
        return(
            <Router>
                <Switch>
                    <Route path = '/help' component = {HelpPage} />
                    <Route path = '/:key' component = {MainPage} />
                    <Route path = '/' component = {CreatePage} />
                </Switch>
            </Router>
        );
    }
}

export default RouterPage;