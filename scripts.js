marked.setOptions({
  breaks: true 
});

const renderer = new marked.Renderer();
renderer.link = function (href, title, text) {
  return `<a target="_blank" href="${href}">${text}</a>`;
};
marked.use({ renderer });

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {input: sampleText};
  }

  handleChange = (event) => {
    this.setState({ input: event.target.value });
  }

  render() {
    return (
      <div>
        <Preview input={this.state.input} />
        <Editor handleChange={this.handleChange} input={this.state.input} />
      </div>
    );
  }    
}

class Preview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {content: ''};
  }

  render() {
    let parsedHtml = marked.parse(this.props.input);    
    return <div id="preview" dangerouslySetInnerHTML={{__html: parsedHtml}}></div>;    
  }
}

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.state = { enabled: false, resizeable: false, height: 300, transition: 'ease-all, .5s'};    
  }

  editorSwitch = (event) => {
    this.setState({ enabled: !this.state.enabled });
  }

  resizeReady = (event) => {
    if (event.target.className == "editor") {
      var rect = event.target.getBoundingClientRect();
      var y = event.clientY - rect.top;
      if (y <= 12) {
        this.setState({ resizeable: true, transition: 'none' });
      }
      document.addEventListener('mousemove', this.resize);
    }
  }

  resize = (event) => {        
    if (this.state.resizeable) {
      let paddingOffset = 12;
      this.setState({ height: window.innerHeight-event.clientY+paddingOffset });
    }
  }

  stopResize = (event) => {
    this.setState({ resizeable: false, transition: 'ease-all, .5s' });
    document.removeEventListener('mousemove', this.resize);
  }

  render() {
    const editingTab = <EditingTab enabled={this.state.enabled} editorSwitch={this.editorSwitch} />;
    const openEditorStyling = {      
      height: this.state.height+'px',
      transition: this.state.transition,
      paddingTop: '12px',
      cursor: 'ns-resize'
    };
    const closedEditorStyling = {
      height: '100px',
      transition: 'ease-all, .5s'
    };

    if (this.state.enabled) {
      return (                
        <div className="editor" style={openEditorStyling} onMouseDown={this.resizeReady} onMouseUp={this.stopResize} >
          {editingTab}
          <textarea id="editor" className="area-opened" onChange={this.props.handleChange}></textarea>
        </div>      
      )
    }
    return (
      <div className="editor" style={closedEditorStyling}>        
        {editingTab}
        <textarea id="editor" className="area-closed" onChange={this.props.handleChange} value={this.props.input}></textarea>
      </div>      
    );
  }
}

class EditingTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleButtonClick = (event) => {
    this.props.editorSwitch(event);
  }

  insertElement = (event, type) => {
    let textArea = document.getElementById('editor');
    if (textArea.selectionStart || textArea.selectionStart == '0') {
      var start = textArea.selectionStart;
      var end = textArea.selectionEnd;
      var element = '';      
      let selectedText = textArea.value.substring(start, end);
      let isTextSelected = selectedText.length != 0;

      switch (type) {
        case 0:
          element = (start==0 ? '' : '\n') + '# ' + selectedText + (isTextSelected ? '\n' : '');
          break;
        case 1:
          element = (start==0 ? '' : '\n') + '## ' + selectedText + (isTextSelected ? '\n' : '');
          break;
        case 2:
          element = '[' + selectedText + '](*link*)';
          break;
        case 3:
          element = '\n```\n' + selectedText + '\n```\n';
          break;
        case 4:
          element = '- ';          
          break;
        case 5:
          element = '> ';
          break;
        case 6:
          element = '![' + selectedText + '](*link*)';
          break;
        case 7:
          element = '**' + selectedText + '**';
          break;
        default:
          element = '';
          break;        
      }
      textArea.value = textArea.value.substring(0, start) + element + textArea.value.substring(end, textArea.value.length);      
    } else {
      textArea.value += element;      
    }

    var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
    let newValue = textArea.value;
    textArea.value = '';
    nativeInputValueSetter.call(textArea, newValue);
    var event = new Event('input', { bubbles: true});
    textArea.dispatchEvent(event);    
    textArea.focus();
    textArea.selectionEnd = start + element.length;
  }

  render() {   

    let tabStyling = {
      position: 'relative',      
      margin: '0 auto',
      width: '100%',
      transition: 'ease-all, .5s',
      content: 'none',
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      borderTopLeftRadius: '20px',
      borderTopRightRadius: '20px',      
      minHeight: '55px',
      height: 'auto',
      paddingTop: '11px',
      paddingBottom: '11px',
      cursor: 'default',
      bottom: 0,
    };

    let buttonStyling = {      
      position: 'relative',  
      zIndex: 10,
      bottom: '5%',      
      margin: '0 auto',
      width: '140px',
      height: '70px',    
      background: 'radial-gradient(#48CFE0, 80%, #43B3F7)',
      borderRadius: '50px',
      color: 'white',
      textAlign: 'center',
      lineHeight: '70px',
      fontSize: '1.7rem',
      fontFamily: "'Poppins', sans-serif",
      boxShadow: '0 0 5px 1px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      transition: 'ease-all, .5s'
    };

    const editIcon = (<i className="fa-solid fa-pencil"></i>);

    const tools = (
      <div id="tab">
        <div id="tools">        
          <div className="tool" title="Header 1" onClick={event => { this.insertElement(event, 0) }}>H1</div>
          <div className="tool" title="Header 2" onClick={event => { this.insertElement(event, 1) }}>H2</div>
          <div className="tool" title="Link" onClick={event => { this.insertElement(event, 2) }}>
            <i className="fa-solid fa-link"></i>
          </div>
          <div className="tool" title="Code" onClick={event => { this.insertElement(event, 3) }}>
            <i className="fa-solid fa-code"></i>
          </div>
          <div className="tool" title="List" onClick={event => { this.insertElement(event, 4) }}>
            <i className="fa-solid fa-list"></i>
          </div>
          <div className="tool" title="Quote" onClick={event => { this.insertElement(event, 5) }}>
            <i className="fa-solid fa-quote-left"></i>
          </div>
          <div className="tool" title="Image" onClick={event => { this.insertElement(event, 6) }}>
            <i className="fa-regular fa-image"></i>
          </div>
          <div className="tool" title="Bold" onClick={event => { this.insertElement(event, 7) }}>
            <i className="fa-solid fa-bold"></i>
          </div>
        </div>
        <div id="close" className="tool" onClick={this.handleButtonClick}>
          X
        </div>
      </div>
    );

    if (this.props.enabled) {
      return (          
        <div id="edit-button" style={tabStyling}>
          {tools}
        </div>        
      );  
    }
    return (<div id="edit-button" style={buttonStyling} onClick={this.handleButtonClick}>EDIT {editIcon}</div>);
  }
}

const sampleText = `# This is Header 1
## This is Header 2
You can learn more about GitHub flavored markdown [here](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax). This markdown previewer is using [Marked](https://marked.js.org/) compiler for parsing GitHub flavored markdown.

Here are some ot the things you can do with it: 
- Create lists
- Make text **bolder**
- Add various [links](https://www.google.com/)
- And many more down below...

You can add blocks of code:
\`\`\`
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {input: sampleText};
  }
}
\`\`\`
Add inline code: \`\`\`<div></div>\`\`\`. It's really easy! Nobody reads this.
> Make quotes!

By the way this page was created as a part of [freeCodeCamp](https://www.freecodecamp.org) Front End Development Libraries projects.

![freeCodeCamp logo](https://cdn.freecodecamp.org/testable-projects-fcc/images/fcc_secondary.svg)`;

const container = document.getElementById('container');
const root = ReactDOM.createRoot(container);
root.render(<App />);