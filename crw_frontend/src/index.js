import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

var BLACK = ';';
var BLANK = '.';
var OK_KEYPRESSES = /[a-zA-Z;. ]/

class Square extends React.Component {
  renderContents() {
    const value = this.props.value;
    if (value === BLACK) {
      return (<rect className="cell-black"></rect>)
    } 
    const display_value = (value === BLANK) ? ' ' : value;
    return (
      <rect className={this.props.cell_type}>
        <text className="cell-pos">{this.props.pos}</text>
        <text className="cell-text">{display_value}</text>
      </rect>
    )
  }
  
  render() {
    return (
      <g className="square" onClick={() => this.props.onClick()}>
        {this.renderContents()}
      </g>
    );
  }
}

class Board extends React.Component {
  // renders Squares and attaches handlers
  renderSquare(i) {
    return <Square
      pos={i}
      value={this.props.squares[i]}
      cell_type={_getCellType(i, this.props.squareSelected, 
        this.props.groupSelected)}
      onClick={() => this.props.handleClick(i)}
    />;
  }

  render() {
    return (
      <div tabIndex="0" className="board-div" onKeyPress={this.props.handleKeyPress}>
        <div className="section-title">Board</div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
          {this.renderSquare(3)}
          {this.renderSquare(4)}
        </div>
        <div className="board-row">
          {this.renderSquare(5)}
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
          {this.renderSquare(9)}
        </div>
        <div className="board-row">
          {this.renderSquare(10)}
          {this.renderSquare(11)}
          {this.renderSquare(12)}
          {this.renderSquare(13)}
          {this.renderSquare(14)}
        </div>
        <div className="board-row">
          {this.renderSquare(15)}
          {this.renderSquare(16)}
          {this.renderSquare(17)}
          {this.renderSquare(18)}
          {this.renderSquare(19)}
        </div>
        <div className="board-row">
          {this.renderSquare(20)}
          {this.renderSquare(21)}
          {this.renderSquare(22)}
          {this.renderSquare(23)}
          {this.renderSquare(24)}
        </div>
      </div>
    );
  }
}

class Wizard extends React.Component {
  render() {
    return (
      <div className="wizard-div">
        <div className="section-title">Wizard</div>
        <div>
          <textarea className="wizard-input" rows="2" cols="40">
          </textarea>
        </div>
        <button type="button" onClick={this.props.solveGroupSelected}>Solve</button>
        <div className="wizard-output">{this.props.output}</div>
      </div>
  )}
}

class BoardMaster extends React.Component {
   // Controls the board: tracks and makes state accessible
  constructor() {
    super();
    const defaultSquares = Array(25).fill(BLANK);
    const defaultIsRowSelected = true;
    this.state = {
      squares: defaultSquares,
      isRowSelected: defaultIsRowSelected,
      groupSelected: _inferGroupSelected(
        0, defaultSquares, defaultIsRowSelected),
      squareSelected: 0,
    };
  }

  handleKeyPress(event) {
    if (!event.key.match(OK_KEYPRESSES)) {return}
    const squares = this.state.squares.slice();
    const charFill = _sanitizeKeyPress(event.key);
    squares[this.state.squareSelected] = charFill;
    const nextSquare = _getNextSquare(
      this.state.squareSelected, this.state.isRowSelected);
    this.setState({
      squares: squares,
      squareSelected: nextSquare,
      groupSelected: _inferGroupSelected(
        nextSquare, squares, this.state.isRowSelected),
    })
  }

  handleClick(i) {
    const alreadySelected = i === this.state.squareSelected;
    if (alreadySelected) {
      this.setState({  // another click changes direction
        isRowSelected: !this.state.isRowSelected,
        groupSelected: _inferGroupSelected(
          i, this.state.squares, !this.state.isRowSelected),
      })
    } else {           // new square selected
      this.setState({
        isRowSelected: true,
        squareSelected: i,
        groupSelected: _inferGroupSelected(
          i, this.state.squares, true),
      })
    }
  }

  solveGroupSelected() {
    const charArray = _getCharArray(this.state.groupSelected, this.state.squares);
    var data = JSON.stringify({char_array: charArray});
    var params = {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: data, 
    };
    const solverEndPoint = '
    
    fetch(solverEndPoint, params)
      .then((response) => response.json())
      .then((responseJson) => {
        return responseJson.groupSolutions;  // array of strings
      })
      .catch((error) => {
        console.error(error);
      });
  }
  
  render() {
    return (
      <div className="boardmaster-div">
        <Board
           squares={this.state.squares}
           rowSelected={this.state.rowSelected}
           groupSelected={this.state.groupSelected}
           squareSelected={this.state.squareSelected}
           handleClick={(i) => this.handleClick(i)}
           handleKeyPress={(e) => this.handleKeyPress(e)}
        />
        <Wizard
           squares={this.state.squares}
           groupSelected={this.state.groupSelected}
           solveGroupSelected={() => this.solveGroupSelected()}
           output=
        />
      </div>
    )
  }
}

const Scratchpad = () => {
   return (
     <div className="scratchpad">
       <div className="section-title">Scratchpad</div>
       <textarea className="textinput" rows="5" cols="30"> 
       </textarea>
     </div>
   ); 
}

class Page extends React.Component {
  // Root component
  render() {
    return (
      <div>
        <BoardMaster />
        <Scratchpad />
      </div>
    );
  }
}

// ========================================
// Board helper functions

function _getNextSquare(i, rowSelected) {  // must change if dims change
  if (rowSelected) {  // advance by 1 unless hitting right boundary
    return Math.min(i+1, Math.floor(i/5)*5 +5);
  } else {            // advance down column
    return Math.min(i+5, 25);
  }
}

function _getCellType(i, squareSelected, groupSelected) {
  if (i === squareSelected) {
    return 'cell-selected';
  } else if (groupSelected.indexOf(i) !== -1) {
    return 'cell-group-selected';
  } else {
    return 'cell';
  }
}

function _range(start, stop, step){
  var a=[], b=start;
  while(b<stop) {a.push(b);b+=step;}
  return a;
};

function _inferGroupSelected(squareSelected, squares, isRowSelected) {
  if (squares[squareSelected] === BLACK) {return [];}
  const candidates = isRowSelected ? 
    _range(Math.floor(squareSelected/5)*5, Math.floor(squareSelected/5)*5+5, 1) :
    _range(squareSelected%5, 25, 5);
  var res = []; 
  var containsSquareSelected = false;
  for (var ix in candidates) {
    var candidate = Number(candidates[ix]);
    if (squares[candidate] === BLACK && !containsSquareSelected) {
      res = [];    // bad group, does not contain selection
    } else if (squares[candidate] === BLACK && containsSquareSelected) {
      return res;  // group ends at black square
    } else {       // non-black square; record into group
      containsSquareSelected = containsSquareSelected || candidate === squareSelected;
      res.push(candidate);
    }
  }
  // group ends at boundary
  return res
}

function _sanitizeKeyPress(key) {
  if (key.match(/[a-zA-Z;]/)) {
    return key.toUpperCase();
  } else {
    return BLANK;
  }
}

// ========================================

ReactDOM.render(
  <Page />,
  document.getElementById('root')
);
