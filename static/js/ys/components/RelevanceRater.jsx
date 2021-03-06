import React from 'react';
import { graphql, compose } from 'react-apollo';
import PropTypes from 'prop-types'

import Spinner from './Spinner'
import * as schema from '../schema';
import { CloseLinkX } from './common'


class RelevanceComponent extends React.Component {

  state = {rating: false}
  componentUnmounting = false

  componentWillUnmount() {
    this.componentUnmounting = true
  }

  static propTypes = {
    point: PropTypes.object.isRequired,
    parentPoint: PropTypes.object.isRequired,
    link: PropTypes.object.isRequired,
    onClose: PropTypes.func
  }

  get relevance() {
    return this.props.link.relevance
  }

  get relevanceVoteCount() {
    return this.props.link.voteCount
  }

  get myRelevanceVote() {
    return this.props.link.relevanceVote
  }

  get sortScore() {
    if (this.props && this.props.link) {
      return this.props.link.sortScore
    }
    else {
      return -1
    }
  }

  handleClickFn = (vote) => (event) => {
    const {point, parentPoint, link} = this.props
    if (this.props.user){
      this.setState({rating: true})
      this.props.rate(point, parentPoint, link.type, vote).
        then( res => {
          if (!this.componentUnmounting)
            this.setState({rating: false})
        });
    } else {
      $("#loginDialog").modal("show");
    }
  }

  linkClassFor = (vote) =>
    "relVoteLink number relVoteLink" + vote + ((this.myRelevanceVote == vote) ? (" myRelevanceVote" + vote) : "")

  isDisabled = () =>
    this.state.rating

  voteButton= (vote) =>
    <button disabled={this.isDisabled()} className={this.linkClassFor(vote)} onClick={this.handleClickFn(vote)}>{vote}<span className="perctSignSmall">%</span></button>


//      {this.state.rating ? <div>Rating...</div> :

  // TODO: add number of Votes so far to relevanceStats
  // TODO: Gene: Remove the sortScore display (or ideally make it admin?)
  render(){
    const {user} = this.props
    return <div className="relCtrlGroup" >
      <span className="claimEditAreaHeading">
        <span className="heading">RATE THIS LINK</span>
        <span className="editAreaClose"><a onClick={this.props.onClose}><CloseLinkX/></a></span>
      </span>
      <div className="relCtrlLabel pointTitle">How Relevant is this claim for you?</div>
       <div className="relCtrlVoteOptions">
         {this.voteButton(100)}
         {this.voteButton(66)}
         {this.voteButton(33)}
         {this.voteButton(0)}
         {this.state.rating && <Spinner />}
       </div>
      <div className="relevanceExplanation">
        <div className="relevanceStats">{this.relevance}% average on {this.relevanceVoteCount} {this.relevanceVoteCount == 1 ? 'vote' : 'votes'} so far</div> 
        <div className="relevanceEquation">Relevance impacts argument scores dramatically. <a target="_blank" href="../WhatIsWhysaurus#whatIsRelevance">Learn more</a>.</div>
        {user && user.admin && <div className="admin">Sort score: {this.sortScore}</div>}
      </div>
    </div>
  }
}

// A Claim's Score * its Avg Relevance = its contribution to its parent's score

export default compose(
  graphql(schema.RelevanceVoteQuery, {
    props: ({mutate}) => ({
      rate: (point, parentPoint, linkType, vote) => mutate({
        variables: {linkType: linkType, url: point.url,
                    parentRootURLsafe: parentPoint.rootURLsafe, rootURLsafe: point.rootURLsafe,
                    vote: vote}
      })
    })
  }),
  graphql(schema.CurrentUserQuery, {
    props: ({ownProps, data: {loading, currentUser, refetch}}) => ({
      userLoading: loading,
      user: currentUser,
      refetchUser: refetch
    })
  })
)(RelevanceComponent)
