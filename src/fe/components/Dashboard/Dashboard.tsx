/* eslint-disable react/no-array-index-key */

import React from 'react';
import {useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import EmailIcon from '@mui/icons-material/Email';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import TrafficIcon from '@mui/icons-material/Traffic';

import {tokens} from '../global/theme';
import {Header} from './Header';
import {ProgressCircle} from './ProgressCircle';
import {StatBox} from './StatBox';
import {WidgetTitle} from './WidgetTitle';
import {LineChart} from './LineChart';

import {mockTransactions} from './mockData';

const BarChart = ({isDashboard}: {readonly isDashboard: boolean}): JSX.Element => <div>{`BarChart(${isDashboard ? 'dashboard' : ''}`}</div>;
const GeographyChart = ({isDashboard}: {readonly isDashboard: boolean}): JSX.Element => <div>{`GeographyChart(${isDashboard ? 'dashboard' : ''}`}</div>;

type PropType = {
	readonly title: string,
	readonly subtitle: string,
};

export const Dashboard = ({
	title,
	subtitle,
}: PropType): JSX.Element => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);
	
	return (
		<Box m="20px">
			{/* HEADER */}
			<Box display="flex" justifyContent="space-between" alignItems="center">
				<Header title={title.toLocaleUpperCase()} subtitle={subtitle} />
				<Box>
					<Button sx={{backgroundColor: colors.blueAccent[700], color: colors.grey[100], fontSize: '14px', fontWeight: 'bold', padding: '10px 20px'}}>
						<DownloadOutlinedIcon sx={{mr: '10px'}} />
						Download Reports
					</Button>
				</Box>
			</Box>

			{/* GRID & CHARTS */}
			<Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gridAutoRows="140px" gap="20px">
				{/* ROW 1 */}
				<Box gridColumn="span 3" sx={{backgroundColor: colors.primary[400]}} display="flex" alignItems="center" justifyContent="center">
					<StatBox title="12,361" subtitle="Emails Sent" progress={0.75} increase="+14%" icon={<EmailIcon sx={{color: colors.greenAccent[600], fontSize: '26px'}} />} />
				</Box>
				<Box gridColumn="span 3" sx={{backgroundColor: colors.primary[400]}} display="flex" alignItems="center" justifyContent="center">
					<StatBox title="431,225" subtitle="Sales Obtained" progress={0.50} increase="+21%" icon={<PointOfSaleIcon sx={{color: colors.greenAccent[600], fontSize: '26px'}}	/>} />
				</Box>
				<Box gridColumn="span 3" sx={{backgroundColor: colors.primary[400]}} display="flex" alignItems="center" justifyContent="center">
					<StatBox title="32,441" subtitle="New Clients" progress={0.30} increase="+5%" icon={<PersonAddIcon sx={{color: colors.greenAccent[600], fontSize: '26px'}} />} />
				</Box>
				<Box gridColumn="span 3" sx={{backgroundColor: colors.primary[400]}} display="flex" alignItems="center" justifyContent="center">
					<StatBox title="1,325,134" subtitle="Traffic Received" progress={0.80} increase="+43%" icon={<TrafficIcon sx={{color: colors.greenAccent[600], fontSize: '26px'}} />} />
				</Box>

				{/* ROW 2 */}
				<Box gridColumn="span 8" gridRow="span 2" sx={{backgroundColor: colors.primary[400]}}>
					<Box mt="25px" p="0 30px" display="flex" justifyContent="space-between" alignItems="center">
						<Box>
							<WidgetTitle title="Revenue Generated" />
							<Typography variant="h5" fontWeight="bold" color={colors.greenAccent[500]}>$59,342.32</Typography>
						</Box>
						<Box>
							<IconButton>
								<DownloadOutlinedIcon sx={{fontSize: '26px', color: colors.greenAccent[500]}} />
							</IconButton>
						</Box>
					</Box>
					<Box height="250px" m="-20px 0 0 0">
						<LineChart isDashboard />
					</Box>
				</Box>
				<Box gridColumn="span 4" gridRow="span 2" sx={{backgroundColor: colors.primary[400]}} overflow="auto">
					<Box display="flex" justifyContent="space-between" alignItems="center" borderBottom={`4px solid ${colors.primary[500]}`} sx={{colors: colors.grey[100]}} p="15px">
						<WidgetTitle title="Recent Transactions" />
					</Box>
					{mockTransactions.map((transaction, i) => (
						<Box key={`${transaction.txId}-${i}`} display="flex" justifyContent="space-between" alignItems="center" borderBottom={`4px solid ${colors.primary[500]}`} p="15px">
							<Box>
								<Typography color={colors.greenAccent[500]} variant="h6" fontWeight="600">{transaction.txId}</Typography>
								<Typography color={colors.grey[100]}>{transaction.user}</Typography>
							</Box>
							<Box color={colors.grey[100]}>{transaction.date}</Box>
							<Box sx={{backgroundColor: colors.greenAccent[500]}} p="5px 10px" borderRadius="4px">${transaction.cost}</Box>
						</Box>
					))}
				</Box>

				{/* ROW 3 */}
				<Box gridColumn="span 4" gridRow="span 2" sx={{backgroundColor: colors.primary[400]}} p="30px">
					<WidgetTitle title="Campaign" />
					<Box display="flex" flexDirection="column" alignItems="center" mt="25px">
						<ProgressCircle progress={.75} size="125" />
						<Typography variant="h5" color={colors.greenAccent[500]} sx={{mt: '15px'}}>$48,352 revenue generated</Typography>
						<Typography>Includes extra misc expenditures and costs</Typography>
					</Box>
				</Box>
				<Box gridColumn="span 4" gridRow="span 2" sx={{backgroundColor: colors.primary[400]}}>
					<Typography variant="h5" fontWeight="600" sx={{padding: '30px 30px 0 30px'}}>Sales Quantity</Typography>
					<Box height="250px" mt="-20px">
						<BarChart isDashboard />
					</Box>
				</Box>
				<Box gridColumn="span 4" gridRow="span 2" sx={{backgroundColor: colors.primary[400]}} padding="30px">
					<Typography variant="h5" fontWeight="600" sx={{marginBottom: '15px'}}>Geography Based Traffic</Typography>
					<Box height="200px">
						<GeographyChart isDashboard />
					</Box>
				</Box>
			</Box>
		</Box>
	);
};
