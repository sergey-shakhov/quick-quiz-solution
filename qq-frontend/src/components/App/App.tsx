import React from 'react';

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';

import RoutedQuiz from '../routed/RoutedQuiz';

import '@fontsource/roboto';
import '@picocss/pico/css/pico.min.css';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/about">
          <div>QuickQuiz helps you to test your knowledge</div>
        </Route>
        <Route path="/quiz/:quizId">
          <RoutedQuiz />
        </Route>
        <Route path="/">
          <div>Quick Quiz - система быстрого тестирования</div>
        </Route>
      </Switch>
    </Router>

  );
}

export default App;
