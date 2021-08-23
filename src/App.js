import './App.css';
import {HashRouter, Route, Switch} from 'react-router-dom';
import EditorList from './component/EditorList';
import EditorComponent from './component/EditorComponent';

function App() {
  return (
    <HashRouter>
      <Switch>
        <Route path={'/editors'} component={EditorList}/>
        <Route path={'/editor/:id'} component={EditorComponent}/>
      </Switch>
    </HashRouter>

  );
}

export default App;
