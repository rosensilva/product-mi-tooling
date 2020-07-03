/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, {Component} from 'react';
import ListViewParent from '../common/ListViewParent';
import ResourceAPI from '../utils/apis/ResourceAPI';
import Link from '@material-ui/core/Link';

import MUIDataTable from "mui-datatables";
import Switch from "react-switch";

export default class ApiListPage extends Component {

    constructor(props) {
        super(props);
        this.apis = null;
        this.state = {
            data: [],
            error: null
        };
    }

    /**
     * Retrieve apis from the MI.
     */
    componentDidMount() {
        this.retrieveApis();
    }

    retrieveApis() {
        const data = [];

        new ResourceAPI().getResourceList(`/apis`).then((response) => {
            this.apis = response.data.list || [];

            this.apis.forEach((element) => {
                const rowData = [];
                rowData.push(element.name);
                rowData.push(element.url);
                rowData.push(element.tracing);
                data.push(rowData);
            });
            this.setState({data: data});
        }).catch((error) => {
            this.setState({error: error});
        });
    }

    renderResourceList() {

        const columns = [
            {
                name: "API Name",
                options: {
                    sortDirection: 'asc',
                    customBodyRender: (value, tableMeta, updateValue) => {
                        return (
                            <Link component="button" variant="body2" onClick={() => {
                                this.props.history.push(`/api/explore?name=${tableMeta.rowData[0]}`)
                            }}>
                                {tableMeta.rowData[0]}
                            </Link>
                        );
                    }
                }
            }, "URL",
            {
                name: "Tracing",
                options: {
                    customBodyRender: (value, tableMeta, updateValue) => {
                        let traceState = false;
                        if ("enabled" === tableMeta.rowData[2]) {
                            traceState = true;
                        }
                        return (<Switch height={25} width={50}
                                        onChange={updatedState => this.handleTraceUpdate(tableMeta.rowData[0], updatedState)}
                                        checked={traceState}/>);
                    }
                }
            }
        ];
        const options = {
            selectableRows: 'none',
            print: false,
            download: false,
        };

        return (
            <MUIDataTable
                title={"API"}
                data={this.state.data}
                columns={columns}
                options={options}
            />
        );
    }

    handleTraceUpdate(apiName, updatedState) {

        let traceState = "disable";
        if (updatedState) {
            traceState = "enable";
        }
        new ResourceAPI().handleApiTraceLevelUpdate(apiName, traceState).then((response) => {
            this.retrieveApis();
        }).catch((error) => {
            if (error.request) {
                this.setState({errorOccurred: true}, function () {
                });
            }
        });
    }

    render() {
        return (
            <ListViewParent
                data={this.renderResourceList()}
                error={this.state.error}
            />
        );
    }
}
