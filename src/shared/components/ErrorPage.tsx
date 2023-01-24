/* eslint-disable react/no-array-index-key */

import React from 'react';
import {styled} from '@mui/material/styles';

type PropsType = {
	error?: Error | string,
};

const PREFIX = 'Error';

const classes = {
	root: `${PREFIX}-root`,
	bold: `${PREFIX}-bold`,
};

const Root = styled('div')(() => ({
	[`& .${classes.root}`]: {
		display: 'flex',
		height: '100vh',
		justifyContent: 'center', // horizontally centered
		alignItems: 'center', // vertically centered
		color: 'red',
	},
	[`& .${classes.bold}`]: {
		fontWeight: 'bold',
	},
}));

const Line = ({title, value: text}: {title: string, value?: string}): JSX.Element => (
	<div>
		<span className={classes.bold}>
			{title}
		</span>
		:&nbsp;
		{text}
	</div>
);

export const ErrorPage = ({
	error,
}: PropsType): JSX.Element => {
	console.error(error);

	const lines: {title: string, value: string}[] = [];

	if (typeof error === 'string') {
		lines.push({title: 'Error', value: error});
	} else if (error instanceof Error) {
		lines.push({title: 'Error', value: error.name});
		lines.push({title: 'Message', value: error.message});
		if (error.stack != null) {
			lines.push({title: 'Stack', value: error.stack});
		}
	}

	return (
		<Root>
			<div className={classes.root}>
				{lines.map((line, index) => <Line key={index} title={line.title} value={line.value} />)}
			</div>
		</Root>
	);
};
