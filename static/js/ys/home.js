import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
const { Map, List, Seq } = require('immutable');
const prettyI = require("pretty-immutable");
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { PointList } from './point_list';
import * as schema from './schema';
import { Form, Text } from 'react-form';
import { Carousel } from 'react-responsive-carousel';
import MediaQuery from 'react-responsive';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import * as validations from './validations';
import * as formUtils from './form_utils.js';
import NewClaim from './components/NewClaim'

class QuickCreate extends React.Component {
  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
    this.errorValidator = this.errorValidator.bind(this);
    this.state = {submitting: false};
  }

  submit(values, e, formApi){
    this.setState({submitting: true});
    this.props.onSubmit(values).then(
      (val) => {
        this.setState({submitting: false});
        formApi.resetAll();
      },
      (err) => {
        this.setState({submitting: false});
      });
  }

  errorValidator(values) {
    return {
      title: validations.validateTitle(values.title)
    };
  }

  submitButton(){
    if (this.state.submitting) {
      return <span>Adding your point...</span>;
    } else {
      return <button onClick={this.props.onClick} className="buttonUX2" type="submit">Save</button>;
    }
  }

  render(){
    let props = this.props;
    return <Form onSubmit={this.submit}
                 validate={this.errorValidator}
                 dontValidateOnMount={true}>
      { formApi => (
          <form onSubmit={formApi.submitForm} className="editPointTextForm">
            <Text onChange={this.props.updateCharCount} field="title" id="editPointTextField" />
            {this.submitButton()}
            <p>{ formApi.errors && formApi.errors.title }</p>
          <p classes={this.props.charsLeft && this.props.charsLeft < 0 ? 'overMaxChars' : ''}>{this.props.charsLeft}</p>
          </form>
      )}
    </Form>;
  }
}

const CountedQuickCreate = formUtils.withCharCount(QuickCreate, validations.titleMaxCharacterCount);

const EditorsPicks = graphql(schema.EditorsPicks, {
  props: ({ownProps, data: { loading, homePage }}) => ({
    loading: loading,
    points: homePage && homePage.editorsPicks
  })
})(PointList);

const NewPoints = graphql(schema.NewPoints, {
  props: ({ownProps, data: { loading, homePage }}) => ({
    loading: loading,
    points: homePage && homePage.newPoints
  })
})(PointList);

class Home extends React.Component {

  constructor(props) {
    super(props);
    this.createNewPoint = this.createNewPoint.bind(this);
  }

  createNewPoint(pointData) {
    if (this.props.CurrentUserQuery.currentUser){
      return this.props.mutate({
        variables: pointData,
        update: (proxy, {data: {newPoint: { point }}}) => {
          const data = proxy.readQuery({ query: schema.HomePage});
          data.homePage.newPoints.unshift(point);
          proxy.writeQuery({query: schema.HomePage, data: data});
        }
      });
    } else {
      $("#loginDialog").modal("show");
      return Promise.reject("User not logged in");
    }
  }

  illustrations(){
    const singleColumnThreshold = 960;
    return <div className="row" id="explanationRowHomepage">
      <MediaQuery minWidth={singleColumnThreshold}>
        <div className="explanationsCentered">
          <div className="explanationBlock">
            <div className="explanationTextCentered">
                Make Arguments<br/><strong>Point-by-Point</strong>
            </div>
            <img className="explanationImageCentered" src="/static/img/homepage_illustration1_smaller.png"/>
          </div>
          <div className="explanationBlock">
            <div className="explanationTextCentered lessWidth">
              <strong>Rate and improve</strong> Points collaboratively
            </div>
            <img className="explanationImageCentered" src="/static/img/homepage_illustration2_smaller.png"/>
          </div>
          <div className="explanationBlock">
            <div className="explanationTextCentered lessWidth">
                <strong>Re-use</strong> Points to build new Arguments
            </div>
            <img className="explanationImageCentered" src="/static/img/homepage_illustration3_smaller.png"/>
          </div>
        </div>
      </MediaQuery>
      <MediaQuery maxWidth={singleColumnThreshold}>
      <Carousel showThumbs={false} showStatus={false} showIndicators={false}>
          <div>
            <img src="/static/img/homepage_illustration1_smaller.png"/>
            <p className="legend">Make Arguments<br/><strong>Point-by-Point</strong></p>
          </div>
          <div>
            <img src="/static/img/homepage_illustration2_smaller.png"/>
            <p className="legend"><strong>Rate and improve</strong> Points collaboratively</p>
          </div>
          <div>
            <img src="/static/img/homepage_illustration3_smaller.png"/>
            <p className="legend"><strong>Re-use</strong> Points to build new Arguments</p>
          </div>
        </Carousel>
      </MediaQuery>
    </div>;
  }

  render(){
    let homePage = this.props.data.homePage;
    let featuredPoint = homePage && homePage.featuredPoint;
    let newPoints = homePage && homePage.newPoints;
    let editorsPicks = homePage && homePage.editorsPicks;
    return <div>
      <NewClaim/>
      {this.illustrations()}
      <h3>Make an Argument You Want to Prove</h3>
      <CountedQuickCreate onSubmit={this.createNewPoint}/>
      <h3>Featured Point:</h3>
      {featuredPoint && <PointList point={featuredPoint}/>}
      <Tabs>
        <TabList>
          <Tab>New</Tab>
          <Tab>Editor's Picks</Tab>
        </TabList>
        <TabPanel>
          <h2>New Points</h2>
          <NewPoints/>
        </TabPanel>
        <TabPanel>
          <h2>Editor's Picks</h2>
          <EditorsPicks/>
        </TabPanel>
      </Tabs>
    </div>;
  }
}

export const HomePage = compose(
  graphql(schema.CurrentUserQuery, {name: 'CurrentUserQuery'}),
  graphql(schema.HomePage),
  graphql(schema.NewPoint)
)(Home);
