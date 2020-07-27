import React, { useState, useEffect } from 'react';
import MaterialTable from 'material-table';
import AddBox from '@material-ui/icons/AddBox';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import moment from 'moment';

const tableIcons = {
    Add: AddBox,
    Check: Check,
    Clear: Clear,
    Delete: DeleteOutline,
    DetailPanel: ChevronRight,
    Edit: Edit,
    Export: SaveAlt,
    Filter: FilterList,
    FirstPage: FirstPage,
    LastPage: LastPage,
    NextPage: ChevronRight,
    PreviousPage: ChevronLeft,
    ResetSearch: Clear,
    Search: Search,
    SortArrow: ArrowUpward,
    ThirdStateCheck: Remove,
    ViewColumn: ViewColumn
};

const myDetailPanel = [
    rowData => ({
        render: () => {
            return rowData.items.length != 1 ? 
                <div>
                    {rowData.items.map(d => (
                        <div>Item: {d.name}. Category: {d.category}. Weight: {d.weight}. Purchase Date: {d.purchase_date}. Cost: {d.cost}</div>
                    ))}
                </div> :
                <div>Weight: {rowData.items[0].weight}. Purchase Date: {rowData.items[0].purchase_date}. Cost: {rowData.items[0].cost}</div>;
        }
    })
];

export default function OrderTable() {
    const attributes = [
        { title: "Name", field: "name", editable: "never", sorting: false},
        { title: "Category", field: "category", editable: "never", sorting: false},
        { title: 'Order Date', field: 'order_date', type: "date"},
        { title: 'Total', field: 'total', type: "numeric"},
        { title: 'Revenue', field: 'revenue', editable: 'never', type: "numeric"},
        { title: 'Profit', field: 'net_profit', editable: 'never', type: "numeric"}
    ];
    const [state, setState] = useState({
        columns: attributes,
        data: []
    });

    const fetchAll = () => {
        fetch("/v1/order")
        .then(res => res.json())
        .then(d => {
            setState((prevState) => {
                let data = [...prevState.data];
                d.forEach(e => {
                    data.push(e);
                })
                //console.log({ ...prevState, data })
                return { ...prevState, data };
            });
        })
        .catch(err => {
            console.log(err);
        });
    };

    useEffect(() => {
        fetchAll();
    }, []);

    return (
        <MaterialTable
        icons={tableIcons}
        title="Order"
        columns={state.columns}
        data={state.data}
        options={{
            actionsColumnIndex: -1,
            sorting: true
        }}
        detailPanel = {myDetailPanel}
        editable={{
            onRowUpdate: async (newData, oldData) => {
                const revenue = 0.9 * newData.total;
                const cost = oldData.revenue - oldData.net_profit;
                const net_profit = revenue - cost;
                const reqData = {
                    order_date: moment(newData.order_date).format("YYYY-MM-DD"),
                    total: newData.total,
                    revenue: Math.round((revenue + Number.EPSILON) * 100) / 100,
                    net_profit: Math.round((net_profit + Number.EPSILON) * 100) / 100
                };
                console.log(reqData);
                const response = await fetch(`/v1/order/${oldData.order_id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(reqData)
                });
                response.json().then(d => {
                    if(!d.err){
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                resolve();
                                if (oldData) {
                                    setState((prevState) => {
                                        let data = [...prevState.data];
                                        data[data.indexOf(oldData)] = {...newData, ...reqData};
                                        return { ...prevState, data };
                                    });
                                }
                            }, 600);
                        });
                    }
                    else{
                        console.log(d.err);
                    }
                });
                
            },
            
            onRowDelete: async (oldData) => {
                const reqData = oldData.items;
                const response = await fetch(`/v1/order/${oldData.order_id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(reqData)
                });
                response.json().then(d => {
                    if(!d.err){
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                resolve();
                                setState((prevState) => {
                                    const data = [...prevState.data];
                                    data.splice(data.indexOf(oldData), 1);
                                    return { ...prevState, data };
                                });
                            }, 600)});
                    }
                    else{
                        console.log(d.err);
                    }
                });
            },
        }}
        />
    );
}