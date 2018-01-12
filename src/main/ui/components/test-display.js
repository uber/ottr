// @flow

/* eslint-env browser */

import React from 'react';
import TestRunner from './test-runner';
import FontAwesome from 'react-fontawesome';
import styled from 'styled-components';
import type {Test} from '../../types';
import {connect} from 'react-redux';
import {restart, stop} from '../modules/runner';
import {getTestUrl} from '../../util';
import {FontAwesomeButton} from "./controls";

const red = 'red';
const green = 'lightgreen';
const blue = 'lightblue';
const gray = 'lightgray';

const colorFromTestProp = ({test}) =>
  test.error ? red : test.done ? green : test.running ? blue : gray;

const Outer = styled.div`
  width: ${props => (props.fullscreen ? '95%' : '18%')};
  border: 1px solid ${colorFromTestProp};
  margin: 10px;
`;

const TestName = styled.div`
  flex-grow: 1;
  font-size: 16px;
  padding: 0.5em;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
  :hover {
    transform: scale(1.1);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  background: ${colorFromTestProp};
  color: ${props => (props.test.error ? 'white' : 'black')};
`;

const getDisplayText = test =>
  test.skipped ? 'skipped' : !test.done && !test.running ? 'queued' : null;

const iconStyle = {marginRight: '1em'};

const findLastLineWithPrefix = (output, prefix) => {
  const lastLine = output.lastIndexOf(`\n${prefix}`);
  if (lastLine >= 0) {
    const lineStart = lastLine + 1;
    const nextNewline = output.indexOf('\n', lineStart);
    return nextNewline >= 0
      ? output.substring(lineStart, nextNewline)
      : output.substring(lineStart);
  }
  return null;
};

/**
 * We don't use regex here because this function will be run very frequently and I want
 * predictable running time
 */
const bestLine = output => {
  let str = findLastLineWithPrefix(output, 'not ok') || findLastLineWithPrefix(output, '# ');
  if (str) {
    return str;
  }
  // Just show the last line
  const lastNewline = output.lastIndexOf('\n');
  if (lastNewline >= 0 && lastNewline < output.length) {
    str = output.substring(lastNewline + 1);
  }
  return str || '...';
};

type Props = {
  test: Test,
  restart: (string, string) => any,
  stop: (string, string) => any
};

type State = {
  showOutput?: boolean,
  fullscreen?: boolean
};

// eslint-disable-next-line no-shadow
const fullOutputStyle = {
  fontSize: '10px',
  padding: 10,
  display: 'block'
};

const firstLineOutputStyle = {
  fontSize: '10px',
  display: 'inline',
  cursor: 'pointer'
};

class TestDisplay extends React.Component<Props, State> {
  state = {};

  stop = () => this.props.stop(this.props.test.session, this.props.test.name);

  restart = () => this.props.restart(this.props.test.session, this.props.test.name);

  toggleOutput = () => this.setState(state => ({showOutput: !state.showOutput}));

  toggleFullscreen = () =>
    this.setState(state => ({fullscreen: !state.fullscreen, showOutput: !state.fullscreen}));

  render() {
    const {test} = this.props;
    const {error, done, running, output, name} = test;
    return (
      <Outer test={test} fullscreen={this.state.fullscreen}>
        <Header test={test}>
          <TestName title={name} onClick={this.toggleFullscreen}>
            {running && <FontAwesome name="circle-o-notch" style={iconStyle} spin />}
            {error && <FontAwesome name="exclamation-triangle" style={iconStyle} />}
            {done && !error && <FontAwesome name="check-circle" style={iconStyle} />}
            {name}
          </TestName>
          <div style={{whiteSpace: 'nowrap'}}>
            <FontAwesomeButton name={running || done ? 'refresh' : 'play'} onClick={this.restart} />
            <FontAwesomeButton name="window-restore" href={getTestUrl(test)} target="_blank" />
            {running && <FontAwesomeButton name="close" onClick={this.stop} />}
          </div>
        </Header>
        <div style={{maxHeight: this.state.fullscreen ? 800 : 200, overflow: 'scroll'}}>
          {output && this.renderOutput(output)}
          {getDisplayText(test)}
          {(running || error) && (
            <TestRunner test={test} key={name} fullscreen={this.state.fullscreen} />
          )}
        </div>
      </Outer>
    );
  }

  renderOutput = output => (
    <div style={{whiteSpace: this.state.showOutput ? null : 'nowrap'}}>
      <FontAwesomeButton
        name={this.state.showOutput ? 'chevron-down' : 'chevron-right'}
        style={iconStyle}
        onClick={this.toggleOutput}
      />
      {this.state.showOutput ? (
        <pre style={fullOutputStyle}>{output}</pre>
      ) : (
        <pre style={firstLineOutputStyle} onClick={this.toggleOutput}>
          {bestLine(output)}
        </pre>
      )}
    </div>
  );
}

export default connect(() => ({}), {restart, stop})(TestDisplay);
