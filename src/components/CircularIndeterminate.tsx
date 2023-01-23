/* eslint-disable react/forbid-component-props */

import React from 'react';
import {styled} from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
const PREFIX = 'CircularIndeterminate';

const classes = {
	root: `${PREFIX}-root`
};

const Root = styled('div')(() => ({
	[`&.${classes.root}`]: {
		display: 'flex',
		height: '100vh',
		justifyContent: 'center', // horizontally centered
		alignItems: 'center', // vertically centered
	}
}));

export const CircularIndeterminate = (): JSX.Element => {
	return (
		<Root className={classes.root}>
			<CircularProgress />
		</Root>
	);
};
