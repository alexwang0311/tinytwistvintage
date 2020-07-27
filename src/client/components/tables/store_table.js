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
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
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

export default function StoreTable() {
    const attributes = [
        { title: 'ID', field: 'id', hidden: "true"},
        { title: 'Name', field: 'name', editable: 'never', sorting: false},
        { title: 'Category', field: 'category', editable: 'never', sorting: false},
        { title: 'Weight', field: 'weight', editable: 'never', sorting: false},
        { title: 'Listing Date', field: 'listing_date', type: "date"},
        { title: 'Price', field: 'listing_price', type: "numeric"}
    ];
    const [state, setState] = useState({
        columns: attributes,
        data: []
    });

    const getInventory = () => {
        fetch("/v1/store")
        .then(res => res.json())
        .then(d => {
            setState((prevState) => {
                let data = [...prevState.data];
                d.forEach(e => {
                    data.push(e);
                });
                return { ...prevState, data };
            });
        })
        .catch(err => {
            console.log(err);
        });
    };

    useEffect(() => {
        getInventory();
    }, []);

    return (
        <MaterialTable
        icons={tableIcons}
        title="Store"
        columns={state.columns}
        data={state.data}
        options={{
            actionsColumnIndex: -1,
            selection: true,
            sorting: true
        }}
        actions={[
            {
                tooltip: 'Add new order',
                icon: ShoppingCartIcon,
                onClick: async (evt, evtData) => {
                    const total = evtData.length == 1 ? evtData[0].listing_price : prompt("Please enter the order total", "0");
                    const payload = {
                        items: evtData,
                        total: total,
                        order_date: moment().format('YYYY-MM-DD')
                    };
                    const addOrderResponse = await fetch("/v1/order", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(payload)
                    });
                    addOrderResponse.json().then(d => {
                        if(!d.err){
                            setTimeout(
                                setState((prevState) => {
                                    let data = [...prevState.data];
                                    evtData.forEach(d => {
                                        data = data.filter(sd => {
                                            return sd.id != d.id;
                                        });
                                        console.log(`after filtering id: ${d.id}. state: `, data);
                                    });
                                    console.log({ ...prevState, data });
                                    return { ...prevState, data };
                                }), 600);
                        }
                        else{
                            console.log(d.err);
                        }
                    })
                }
            }
        ]}
        detailPanel={[
            {
              tooltip: 'Details',
              render: rowData => {
                return (
                  <div>
                    {`Purchase date: ${rowData.purchase_date}. Cost: ${rowData.cost}`}
                  </div>
                )
              },
            }
        ]}
        editable={{
            onRowUpdate: async (newData, oldData) => {
                const reqData = {
                    listing_date: moment(newData.listing_date).format("YYYY-MM-DD"),
                    listing_price: newData.listing_price
                };
                console.log(newData, reqData);
                const response = await fetch(`/v1/store/${oldData.id}`, {
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
                const response = await fetch(`/v1/store/${oldData.id}`, {
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