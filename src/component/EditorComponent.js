import React from 'react';
import {Editor} from 'react-draft-wysiwyg';
import config from '../api/Config';
import api from '../api/Api';
import {convertFromRaw, convertToRaw, EditorState} from 'draft-js';

const uuid = new Date().getTime();

class EditorComponent extends React.Component {
  state = {}
  ref = undefined;


  componentDidMount() {
    this.setState({editorId: this.props.match.params.id}, this.loadEditor)
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.editorId !== prevState.editorId) {
      this.loadEditor();
    }
  }

  componentWillUnmount() {
    if (this.conn) {
      console.log('closing socket...')
      this.conn.close();
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextId = nextProps.match.params.id;
    if (nextId !== prevState.editorId) {
      return ({editorId: nextId})
    }
    return ({});
  }

  initSocket = () => {
    console.log('init websocket...');
    const {editorId} = this.state;
    const _this = this;
    this.conn = new WebSocket(config.wsUrl + `/editor/${editorId}/ws`);
    this.conn.onclose = function (evt) {
      console.log('close event:', evt)
      console.log('reconnecting...')
      _this.setState({
        connected: false,
      }, _this.initSocket)
    }
    this.conn.onopen = () => {
      console.log('socket connected!');
      this.setState({
        connected: true,
      })
      this.conn.onmessage = (wsm) => {
        if (wsm && wsm.type === 'message') {
          try {
            const msg = JSON.parse(wsm.data);
            const {type, data} = msg;
            this.onEvent(type, data);
          } catch (e) {
          }
        }
      }
    }
  }

  loadEditor = () => {
    const {editorId} = this.state;
    api.get(`/editor/${editorId}`).then(resp => {
      let savedState = EditorState.createEmpty();
      try {
        savedState = EditorState.createWithContent(convertFromRaw(JSON.parse(resp.editor.content)));
      } catch (e) {
        console.log("fail to parse response from server");
      }
      document.title = `Editor: ${resp.editor.displayName}`;
      this.setState({
        editor: resp.editor,
        editorState: savedState,
      }, this.initSocket)
    }).catch(err => {
      this.setState({err: err});
    })
  }

  sendEvent = (type, data) => {
    if (this.conn) {
      this.conn.send(JSON.stringify({
        type: type,
        data: data,
      }))
    }
  }

  saveCurrentContent = () => {
    const {editorState, editor, editorId} = this.state;
    api.post(`/editor/${editorId}/content`, {
      content: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
      version: editor.version,
    }).then(resp => {
      editor.version = resp.version;
      this.setState({editor: editor});
    }).catch(err => {
      console.log('error', err);
      if (err.editor) {
        if (editor.version !== err.editor.version) {
          if (window.confirm("Document out of sync. Do you want to reload?")) {
            this.setState({editor: err.editor});
          }
        }
      }
    })
  }

  onEvent = (type, data) => {
    console.log("received event", type);
    switch (type) {
      case 'editor_state_change': {
        const {editor} = this.state;
        const {eventId, editorId, content} = data;
        if (eventId === uuid || editorId !== editor.id) {
          return
        }
        let contentState = convertFromRaw(content);
        let newState = EditorState.createWithContent(contentState);
        this.setState({
          editorState: newState,
        })
        break
      }
      case 'editor_display_name_updated': {
        const {editor} = this.state;
        console.log(data);
        const {eventId, editorId} = data;
        const {displayName} = data.editor;
        if (eventId === uuid || editorId !== editor.id) {
          return;
        }
        const newEditor = Object.assign({}, editor);
        newEditor.displayName = displayName;
        this.setState({editor: newEditor}, () => {
          document.title = `Editor: ${displayName}`
        })
      }
    }
  }

  onEditorStateChange = (state) => {
    const {editor} = this.state;
    const contentState = state.getCurrentContent();
    let content = convertToRaw(contentState);
    this.sendEvent("editor_state_change", {"eventId": uuid, "editorId": editor.id, content})
    this.setState({
      editorState: state,
    })
  }
  rename = () => {
    const {id} = this.props.match.params;
    const newName = window.prompt("Enter new name for this editor");
    if (newName && newName.length > 0) {
      api.post(`/editor/${id}/displayName/${newName}`).then(resp => {
        // console.log('success');
      })
    }
  }

  render = () => {
    const {editor, editorState, err} = this.state;
    return (
      <div>
        {err && <h2>{err.status} - {err.statusText}</h2>}
        {editor &&
        <div style={{display: 'inline'}}><a href={`/#/editors`}>Editors</a> / <a>{editor.displayName}</a></div>}
        <br/>
        {editor && <div style={{display: 'inline'}}>
          <button onClick={this.saveCurrentContent}>Save</button>
          <button onClick={this.rename}>Rename</button>
        </div>}
        <hr/>
        {editor && <Editor onEditorStateChange={this.onEditorStateChange} editorState={editorState} ref={(t) => {
          this.ref = t;
        }}/>}
      </div>
    );
  }
}

export default EditorComponent;
