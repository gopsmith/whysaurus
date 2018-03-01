import React from 'react'
import * as validations from '../validations';
import * as formUtils from '../form_utils.js';
import { Form, Text } from 'react-form';
import TitleText from './TitleText'

export class NewClaim extends React.Component {
  constructor(props) {
    super(props)
  }

  render(){
    return <Form onSubmit={this.props.onSubmit}
                 validate={values => ({title: validations.validateTitle(values.title)})}>
      { formApi => (
        <form onSubmit={formApi.submitForm} id="form1" className="addEvidenceForm">
          <TitleText id="title" className="addEvidenceFormTextField" placeholder='Make a claim, eg "Dogs can learn more tricks than cats."' />
          <button type="submit">Add</button>
          <button type="cancel" className="cancelButton cancelButtonAddEvidence" onClick={this.props.onCancel}>Cancel</button>
        </form>
      )}
    </Form>
  }
}
