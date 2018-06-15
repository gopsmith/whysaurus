import React from 'react'
import * as validations from '../validations';
import { Form, Text } from 'react-form';
import * as schema from '../schema';
import { graphql, compose } from 'react-apollo';
import TitleText from './TitleText'
import Spinner from './Spinner'
import { CloseLinkX } from './common'
import ImagePicker from './ImagePicker';
import config from '../config'


class EditImageForm  extends React.Component {

  state = {imageUpdated: false}

  render() {
    const {point, onSubmit, onClick, heightClass} = this.props
    let captionButtonLabel = `${point.imageDescription ? "Update Caption" : "Add Caption" }`
    return ( 
        <Form onSubmit={onSubmit}
              defaultValues={{imageURL: point.imageURL, imageDescription: point.imageDescription}}
              validate={values => ({imageDescription: validations.validateCaption(values.imageDescription)})}>
          { ({submitForm, values: {imageDescription, imageURL}, touched, validationFailures}) => (
            <form onSubmit={submitForm} id="form1" className="">
              <ImagePicker field="imageURL"
                onUploaded={(file) => {
                  this.setState({imageUpdated: true})
                  submitForm()
                }}
                onTransformed={(result) => {
                  console.log("Saved transformed versions of image:")
                  console.log(result)
                }}
                />
               {imageURL && <img className="imageBigDisplay" src={config.cdn.baseURL + imageURL} alt={imageDescription}/>}           
                <div className="">
                  <Text className="inputFieldUX2 inputFieldUX2multi" field="imageDescription" onClick={onClick} onSubmit={submitForm} placeholder="Add a caption, credit, description, etc"/>
                </div>
                <div className="">
                  <button onClick={this.props.onClose} className="buttonUX2 pull-right">Done</button>                
                  <button onClick={onClick} disabled={(!this.state.imageUpdated) && (imageDescription == point.imageDescription)} className="buttonUX2 pull-right buttonUX2marginR" type="submit">{captionButtonLabel}</button>
                </div>

            </form>
          )}
        </Form>
    );
  }
}


class EditImageComponent extends React.Component {
  state = {saving: false}

  get point() {
    return this.props.point;
  }

  handleClickNoProp = (e) => {
    e.stopPropagation();
  }

  handleClickSave = (values, e, formApi) => {
    values.url = this.point.url
    this.setState({saving: true})
    this.props.save(values).
      then((result) => {
        this.setState({saving: false})
        this.props.onClose(e)
      },
           (err) => this.setState({saving: false}))
  }

  renderForm = () => {
    let editImageFormClasses = ""
    if (this.state.saving) {
      return <div className={editImageFormClasses}>
        <span className="claimEditAreaSavingFeedback"><Spinner /><span className="spinnerLabel">Saving...</span></span>
      </div>;
    } else {
      return <div className={editImageFormClasses}>
        <EditImageForm onClick={this.handleClickNoProp} onSubmit={this.handleClickSave} onClose={this.props.onClose} point={this.point} />
      </div>;
    }
  }

  render() {
    let editImageLabel = `${this.props.hasImage ? "Edit Image" : "Add Image"}`
    return <div className="row-fluid claimEditArea editImage ">
      <span className="claimEditAreaHeading">
        <span className="heading">{editImageLabel}</span>
        <span className="editAreaClose"><a onClick={this.props.onClose}><CloseLinkX/></a></span>
      </span>
      <div className="imageEditForm">    
        {this.renderForm()}
      </div>
    </div>

  }
}

export default compose(
  graphql(schema.EditPointQuery, {
    props: ({mutate}) => ({
      save: (values) => mutate({
        variables: values
      })
    })
  }),
)(EditImageComponent)
