import React, { useState, useEffect } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { XAxis, YAxis, ResponsiveContainer, BarChart, CartesianGrid, Bar, Legend, Tooltip, ComposedChart, Line } from 'recharts';
import Title from '../utils/title';

export default function OrderLineChart() {
    const theme = useTheme();

    const [data, setData] = useState([]);

    useEffect(() => {
        fetch(`/v1/stats/order`)
        .then(res => res.json())
        .then(data => {
            //console.log(d);
            let res = []
            data.forEach((d, index) => {
                if(index == 0){
                    res.push({
                        revenue: d.revenue,
                        profit: d.profit,
                        revenueToDate: d.revenue,
                        profitToDate: d.profit,
                        order_date: d.order_date
                    });
                }
                else{
                    console.log(res[index - 1]);
                    const revenueToDate = d.revenue + res[index - 1].revenueToDate;
                    const profitToDate = d.profit + res[index - 1].profitToDate;
                    res.push({
                        revenue: d.revenue,
                        profit: d.profit,
                        revenueToDate: parseFloat((parseFloat(revenueToDate)).toFixed(2)),
                        profitToDate: parseFloat((parseFloat(profitToDate)).toFixed(2)),
                        order_date: d.order_date
                    });
                }
            });
            //console.log(res);
            setData(res);
        })
        .catch(err => {
            console.log(err);
        });
    }, []);
    
    return (
        <React.Fragment>
            <Title>Sales</Title>
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
                    <XAxis dataKey="order_date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" />
                    <Bar dataKey="profit" fill="#82ca9d" />
                    <Line type="monotone" dataKey="revenueToDate" stroke="#ff7300" />
                    <Line type="monotone" dataKey="profitToDate" stroke="#67a9cf" />
                </ComposedChart >
            </ResponsiveContainer>
        </React.Fragment>
    );
}