import React, { useState, useEffect, Fragment } from 'react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';
import Typography from '@material-ui/core/Typography';
import Title from '../utils/title';

const category2Color = {
    "Tshirts": "#d73027",
    "Home Goods": "#3288bd",
    "Outerwears": "#2ca25f",
    "Accessories": "#fdae61",
    "Pins": "#fee08b",
    "Sweatshirts": "#ffffbf",
    "Toys": "#e6f598",
    "Books": "#8c510a",
    "Bags": "#66c2a5",
    "Pants": "#5e4fa2",
    "Shoes": "#c51b8a",
    "Others": "#bababa"
};

const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const {
        cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
        fill, payload, percent, value,
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#1a1a1a">{payload.name}</text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 6}
                outerRadius={outerRadius + 10}
                fill={fill}
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value}`}</text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                {`(${(percent * 100).toFixed(2)}%)`}
            </text>
        </g>
    );
};


export default function MyPieChart(props) {
    const [state, setState] = useState({
        data: [],
        activeIndex: 0,
    });

    useEffect(() => {
        fetch(`/v1/${props.type}/count`)
        .then(res => res.json())
        .then(d => {
            setState((prevState) => {
                let data = [...prevState.data];
                d.forEach(e => {
                    data.push({name: e.category, value: e.count});
                });
                //console.log({ ...prevState, data });
                return { ...prevState, data };
            });
        })
        .catch(err => {
            console.log(err);
        });
    }, []);

    const onPieEnter = (data, index) => {
        setState((prevState) => {
            const activeIndex = {activeIndex: index};
            return {...prevState, ...activeIndex};
        });
    };

    return (
        <Fragment>
            <Title align="center">{props.type.charAt(0).toUpperCase() + props.type.slice(1)}</Title>
            <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                    <Pie
                        activeIndex={state.activeIndex}
                        activeShape={renderActiveShape}
                        data={state.data}
                        cx="50%"
                        cy={200}
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                    >
                        {state.data.map(d => <Cell fill={category2Color[d.name]}/>)}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <Typography align="center" component="h4" variant="h6" color="inherit" noWrap>
                total: {state.data.map(d => d.value).reduce((a, b) => a + b, 0)}
            </Typography>
        </Fragment>
    );
}