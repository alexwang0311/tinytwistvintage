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
import StoreIcon from '@material-ui/icons/Store';
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

export default function InventoryTable() {
    const categories = ["Tshirts", "Sweatshirts", "Outerwears", "Accessories", "Pins", "Home Goods", "Toys", "Books", "Bags", "Pants", "Shoes","Others"];
    let categoryLookup = {};
    categories.forEach((d, index) => {
        categoryLookup[index] = d;
    })

    const attributes = [
        { title: "ID", field: "id", hidden: true},
        { title: 'Name', field: 'name', sorting: false },
        { title: 'Category', field: 'category', lookup: categoryLookup, sorting: false},
        { title: 'Weight', field: 'weight', sorting: false},
        { title: 'Purchase Date', field: 'purchase_date', type: "date"},
        { title: 'Cost', field: 'cost', type: "numeric"}
    ];
    const [state, setState] = useState({
        columns: attributes,
        data: []
    });

    const fetchAll = async () => {
        await fetch("/v1/inventory")
                .then(res => res.json())
                .then(d => {
                    setState((prevState) => {
                        let data = [...prevState.data];
                        d.forEach(e => {
                            data.push(e);
                        })
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
        title="Inventory"
        columns={state.columns}
        data={state.data}
        actions={[
            {
                icon: StoreIcon,
                tooltip: 'Add to store',
                onClick: async (event, rowData) => {
                    const price = prompt("Please enter the listing price", "0");
                    const id = rowData.id;
                    const payload = {
                        listing_date: moment().format('YYYY-MM-DD'),
                        listing_price: price
                    };
                    const response = await fetch(`/v1/store/${id}`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(payload)
                    });

                    response.json().then(d => {
                        if(!d.err){
                            setTimeout(() => {
                                setState((prevState) => {
                                    let data = [...prevState.data];
                                    data.splice(data.indexOf(rowData), 1);
                                    return { ...prevState, data };
                                });
                            }, 600);
                        }
                        else{
                            console.log(d.err);
                        }
                    });
                }
            }
        ]}
        options={{
            actionsColumnIndex: -1,
            sorting: true
        }} 
        editable={{
            onRowAdd: async (newData) => {
                const reqData = {
                    name: newData.name,
                    category: categories[newData.category],
                    weight: newData.weight,
                    purchase_date: moment(newData.purchase_date).format("YYYY-MM-DD"),
                    cost: newData.cost
                };
                const response = await fetch("/v1/inventory", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(reqData)
                });
                response.json().then(d => {
                    if(!d.err){
                        return new Promise((resolve, reject) => {
                            setTimeout(() => {
                                resolve();
                                setState((prevState) => {
                                    const tmp = {
                                        id: d.id,
                                        name: newData.name,
                                        category: newData.category,
                                        weight: newData.weight,
                                        purchase_date: newData.purchase_date,
                                        cost: newData.cost
                                    };
                                    let data = [...prevState.data];
                                    data.push(tmp);
                                    return { ...prevState, data };
                                });
                            }, 600);
                        });
                    }
                    else{
                        console.log(d.err);
                    }
                });
            },
            
            onRowUpdate: async (newData, oldData) => {
                const reqData = {
                    name: newData.name,
                    category: categories[newData.category],
                    weight: newData.weight,
                    purchase_date: moment(newData.purchase_date).format("YYYY-MM-DD"),
                    cost: newData.cost
                };
                const response = await fetch(`/v1/inventory/${oldData.id}`, {
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
                                        data[data.indexOf(oldData)] = newData;
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
                const response = await fetch(`/v1/inventory/${oldData.id}`, {
                    method: "DELETE"
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