import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'react-apollo';
import * as schema from '../schema';

class ClaimSearch extends React.Component {
  static propTypes = {
    render: PropTypes.func.isRequired
  }

  render(){
    const {search, loading} = this.props.data || {}
    return (
      this.props.render({results: search, searching: loading})
    )
  }
}

export default graphql(schema.Search, {
  skip: (ownProps) => !ownProps.query || (ownProps.query == '')
})(ClaimSearch)
