import React, { useState, useEffect } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { XAxis, YAxis, ResponsiveContainer, CartesianGrid, Bar, Legend, Tooltip, ComposedChart, Line } from 'recharts';
import Title from '../utils/title';

export default function FollowerChart() {
    const theme = useTheme();

    const [data, setData] = useState([]);

    useEffect(() => {
        async function fetchData(){
            await fetch(`/v1/stats/follower`)
                .then(res => res.json())
                .then(d=> {setData(d);})
                .catch(err => {
                    console.log(err);
                });
        };
        fetchData();
    }, []);

    return (
        <React.Fragment>
            <Title>Followers</Title>
            <ResponsiveContainer>
                <ComposedChart 
                    data = {data}
                    margin={{
                        top: 16,
                        right: 16,
                        bottom: 0,
                        left: 24,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis type="number" domain={[Math.min(...(data.map(d => d.count))) - 20, Math.max(...(data.map(d => d.count))) + 20]} yAxisId="left"/>
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="right" dataKey="increase" fill="#8884d8" />
                    <Line yAxisId="left" type="monotone" dataKey="count" stroke="#ff7300" />
                </ComposedChart >
            </ResponsiveContainer>
        </React.Fragment>
    );
}