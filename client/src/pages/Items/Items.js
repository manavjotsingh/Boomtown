import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import styles from './styles';

const Items = ({ classes }) => {
  return (
    <div>
      <p>
        This is the items page located at <code>/items</code>.
      </p>
    </div>
  );
};

export default withStyles(styles)(Items);
