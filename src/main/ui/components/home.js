// @flow

import React from 'react';
import TestRunner from './test-runner';
import {connect} from 'react-redux';
import type {ReduxStateType} from '../types';
import DocumentTitle from 'react-document-title';

function Home({tests}) {
  const running = tests.filter(test => test.running);
  return (
    <div>
      <div style={{display: 'flex'}}>
        <div><img src="images/ottr.jpg" width={100} /></div>
        <div>
          <h1>ottr</h1>
          running {running.length}<br/>
          failed {tests.filter(t => t.failed).length}<br/>
          queued {tests.filter(t => !t.done).length}<br/>
        </div>
      </div>
      <DocumentTitle title={`ottr (${tests.length})`} />
      <div style={{display: 'flex'}}>
        {running.map(test => <TestRunner test={test} key={test.name} />)}
      </div>
    </div>
  );
}

const mapStateToProps = ({runner: {tests}}: ReduxStateType) => ({tests});

export default connect(mapStateToProps, {})(Home);
