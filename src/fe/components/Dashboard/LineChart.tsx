/* eslint-disable react/forbid-component-props */

import React from 'react';
//import CircularIndeterminate from '../../components/CircularIndeterminate';
//import ErrorPage from '../../pages/ErrorPage';
//import {useTimesheets} from '../../data/dashboard';
import {useTheme} from '@mui/material/styles';
import {LineChart as BaseLineChart, Line, XAxis, YAxis, ResponsiveContainer, Legend} from 'recharts';
//import Title from './Title';

import {tokens} from '../global/theme';
import {mockLineData} from './mockData';

type dataType = {
	name: string,
	japan: number,
	france: number,
	us: number,
}[];

const getData = (): dataType => {
	const data: dataType = mockLineData[0].data.map(line => ({
		name: line.x,
		japan: 0,
		france: 0,
		us: 0,
	}));

	mockLineData.forEach(country => {
		country.data.forEach(line => {
			const f = data.find(e => e.name === line.x);

			if (f && ['japan', 'france', 'us'].includes(country.id)) {
				f[country.id as ('japan' | 'france' | 'us')] = line.y;
			}
		});
	});

	return data;
};

type PropType = {
	readonly isDashboard: boolean,
};

export const LineChart = ({
	isDashboard = false,
}: PropType): JSX.Element => {
	const theme = useTheme();
	//const colors = tokens(theme.palette.mode);

	console.log('LineChart', isDashboard);

	return (
		<ResponsiveContainer>
			<BaseLineChart data={getData()} margin={{top: 24, right: 24, bottom: 24, left: 24}}>
				<XAxis dataKey="name" stroke={theme.palette.text.secondary} style={theme.typography.body2} />
				<YAxis stroke={theme.palette.text.secondary} style={theme.typography.body2} />
				<Line isAnimationActive animationDuration={500} type="monotone" dataKey="japan" stroke={tokens('dark').greenAccent[500]} activeDot={{r: 8}} />
				<Line isAnimationActive animationDuration={500} type="monotone" dataKey="france" stroke={tokens('dark').blueAccent[300]} />
				<Line isAnimationActive animationDuration={500} type="monotone" dataKey="us" stroke={tokens('dark').redAccent[200]} />
				<Legend />
			</BaseLineChart>
		</ResponsiveContainer>
	);
};
