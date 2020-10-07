import React from 'react';
import './App.css';
import StartPage from './components/startPage/Index';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
import SignupPage from './components/signupPage/Index';
import Home from './components/Home/Index';
import 'antd/dist/antd.css';
import LoginPage from './components/loginPage/Index';
import Dashboard from './components/Dashboard/Dashboard';


class App extends React.Component{
  
  constructor(props){
    super(props);
    this.state={
        login: false
    };
  }

  handleSignOut(){
    // SignOut
    this.setState({login:false});
    // API needed to sign out

    
    // After logout request finished, redirect to entry page
    this.props.history.push('/');
  }

  render(){
      return(
        <BrowserRouter>          
          <div>          
              <Switch>      
                <Route path='/home/:id' component={Home}/>      
                <Route path='/signupPage' component={SignupPage}/>
                <Route path='/login' component={LoginPage}/>
                <Route path='/Transaction' component={Dashboard}/>
                <Route path='/' component={StartPage}/>
              </Switch>           
          </div> 
        </BrowserRouter>    
      )     
  }
}

export default App;
