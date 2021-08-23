import React, {useState, useEffect} from 'react';
import api from '../api/Api';


export default function EditorList() {
  const [editors, setEditors] = useState([]);
  useEffect(() => {
    const getEditors = () => {
      api.get(`/editors`).then(resp => {
        setEditors(resp.editors ? resp.editors : []);
      })
    }
    if (!editors || editors.length === 0) {
      getEditors();
    }
  })

  const addNewEditor = () => {
    const name = window.prompt("Entering new editor name");
    if (name) {
      api.post(`/editors`, {
        displayName: name,
      }).then(resp => {
        const ed = []
        ed.push(...editors);
        ed.push(resp.editor);
        setEditors(ed);
      })
    }
  }

  const checkedChange = (ed) => (e) => {
    api.post(`/editor/${ed.id}/public/${e.target.checked === true}`).then(resp => {
      console.log('success');
    })
  }

  return <div>
    <h2>My Editors</h2>
    <table>
      <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Public</th>
      </tr>
      </thead>
      <tbody>
      {editors.map(ed =>
        <tr key={`table-row-editor-id-${ed.id}`}>
          <td><a href={`/#/editor/${ed.id}`}>{ed.id}</a></td>
          <td>{ed.displayName}</td>
          <td><input type={'checkbox'} onChange={checkedChange(ed)} defaultChecked={ed.public}/></td>
        </tr>
      )}
      </tbody>
    </table>
    <button style={{marginTop: 8}} onClick={addNewEditor}>New Editor</button>
  </div>
}