import React from 'react';
import DateTime from 'react-datetime';
import Column from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import { MdAdd, MdRemove } from 'react-icons/md';
import 'react-datetime/css/react-datetime.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactCopy from 'copy-to-clipboard';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Moment from 'moment';
import t from 'tcomb-form'
import { extendMoment } from 'moment-range';
import { isMobile } from 'react-device-detect';
import './Main.css';

const moment = extendMoment(Moment);
const Form = t.form.Form;

const FormSchema = t.struct({
    name: t.String,         // a required string
})

class CreatePage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: {
                user:
                {
                    dates: [
                        {
                            startDate: new Date(),
                            endDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours(), new Date().getMinutes() + 60)
                        }
                    ],
                    id: 0
                }

            },
            intersections: [],
            value: '',
            response: {},
            sent: false,
            key: ''
        }
    }

    timeChange = (date, index, type) => {
        let data = this.state.data;
        let objarr = data.user.dates;
        console.log(objarr);
        if (type === 'end') {
            if (objarr[index].startDate.getTime() >= date.getTime()) {
                alert('End Date cannot be smaller than Start Date');
                return;
            }
        }
        for (let a = 0; a < objarr.length; a++) {       //Check for user
            if (index === a)
                continue;
            if (date.getTime() >= objarr[a].startDate.getTime() && date.getTime() <= objarr[a].endDate.getTime()) {
                alert('Same date cannot be selected');
                return;
            }
        }
        if (type === 'start') {
            objarr[index].startDate = date;
            objarr[index].endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() + 1, date.getMinutes());
        }
        else if (type === 'end') {
            if (objarr[index].startDate.getTime() >= date.getTime()) {
                alert('End Date cannot be smaller than Start Date');
                return;
            }
            objarr[index].endDate = date;
        }
        data.user.dates = objarr;
        this.setState({ data: data });
    }


    dateLists = (items) => {
        let dateCardClass = "Datecard"
        return (
            items.map((item, index) => {
                if (index == items.length - 1)
                    dateCardClass = "Datecard"
                else
                    dateCardClass = "Datecard Bottomborder"
                return (
                    <Column>
                        {
                            isMobile
                                ?
                                <Column className={dateCardClass}>
                                    <Column className="Datecardcol">
                                        <p className="Datetext">Start Date</p>
                                        <div style = {{marginTop: 4}}>
                                            <DateTime
                                                inputProps={{readOnly: true}}
                                                value={item.startDate}
                                                timeFormat="HH:mm"
                                                dateFormat="MMMM DD, YYYY"
                                                onChange={(date) => { this.timeChange(date.toDate(), index, 'start'); }}
                                            />
                                        </div>
                                    </Column>
                                    <Column className="Datecardcol">
                                        <p className="Datetext">End Date</p>
                                        <div style = {{marginTop: 4}}>
                                            <DateTime
                                                inputProps={{readOnly: true}}
                                                value={item.endDate}
                                                timeFormat="HH:mm"
                                                dateFormat="MMMM DD, YYYY"
                                                onChange={(date) => { this.timeChange(date.toDate(), index, 'end'); }}
                                            />
                                        </div>
                                    </Column>
                                </Column>

                                :
                                <Row className={dateCardClass}>
                                    <Row className="Datecardrow">
                                        <p className="Datetext">Start Date:</p>
                                        <div>
                                            <DateTime
                                                inputProps={{readOnly: true}}
                                                value={item.startDate}
                                                timeFormat="HH:mm"
                                                dateFormat="MMMM DD, YYYY"
                                                onChange={(date) => { this.timeChange(date.toDate(), index, 'start'); }}
                                            />
                                        </div>
                                    </Row>
                                    <Row className="Datecardrow">
                                        <p className="Datetext">End Date: </p>
                                        <div>
                                            <DateTime
                                                inputProps={{readOnly: true}}
                                                value={item.endDate}
                                                timeFormat="HH:mm"
                                                dateFormat="MMMM DD, YYYY"
                                                onChange={(date) => { this.timeChange(date.toDate(), index, 'end'); }}
                                            />
                                        </div>
                                    </Row>
                                </Row>
                        }
                    </Column>
                )
            })
        );
    }


    options = {
        fields: {
            name: {
                label: ' ',
                error: 'Please enter a name.',
                attrs: {
                    placeholder: 'Name',
                }
            }
        }
    }

    form = () => {
        return (
            <Container style={isMobile ? { width: '98%' } : { width: '50%' }} className="Form" >
                <Form
                    value={this.state.value}
                    onChange={(val) => { this.setState({ value: val }); }}
                    ref="form"
                    options={this.options}
                    type={FormSchema} />
                <div className="form-group">
                    <Button
                        style={{ marginLeft: 'auto', marginRight: 'auto' }}
                        onClick={async () => {
                            const value = this.refs.form.getValue();
                            if (value != null) {
                                let name = value.name;
                                let res = await fetch('/api', {
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                    },
                                    method: 'POST',
                                    body: JSON.stringify({ name: name, dates: this.state.data.user.dates })
                                });
                                let resjson = await res.json();
                                console.log(resjson);
                                this.setState({ response: resjson, key: resjson.key }, () => {
                                    ReactCopy('https://ibkmeetup.herokuapp.com/' + resjson.key)
                                    alert('Copied to clipboard');
                                    this.props.history.push('/' + resjson.key);
                                })
                            }
                        }} type="submit">Create Room</Button>
                </div>
            </Container>
        )
    }

    renderUser = () => {
        let items = [this.state.data.user];
        return items.map((item, index) => {
            return (
                <Column className="Card" style={{ paddingTop: 16 }}>
                    <p className="Availabledate">Select your available dates:</p>
                    {this.dateLists(item.dates, 'user')}
                    <Row className="justify-content-center">
                        {this.state.data.user.dates.length !== 1 ?
                            <MdRemove
                                style={{ color: '#222', fontSize: 24 }}
                                onClick={() => {
                                    let data = this.state.data;
                                    let dates = data.user.dates;
                                    dates.pop();
                                    data.user.dates = dates;
                                    this.setState({ data: data });
                                }} /> : <div></div>}
                        <MdAdd
                            style={{ color: '#ff4444', fontSize: 30 }}
                            onClick={() => {
                                let data = this.state.data;
                                let dates = item.dates;
                                let max = 0;
                                let datelen = dates.length;
                                for (let j = 0; j < datelen; j++) {
                                    if (j === 0) {
                                        max = dates[j].endDate.getTime();
                                        continue;
                                    }
                                    if (max < dates[j].endDate.getTime())
                                        max = dates[j].endDate.getTime();
                                }
                                /*for(let a=0; a<dates.length; a++){
                                  if(date >= dates[a].startDate && date <= dates[a].endDate){
                                    while((date >= dates[a].startDate && date <= dates[a].endDate)){
                                      date = date + 1860000;
                                    }
                                  }
                                }*/
                                let date = max;
                                dates.push({
                                    startDate: new Date(date + 120000),
                                    endDate: new Date(date + 3720000)
                                });
                                data.user.dates = dates;
                                this.setState({ data: data });
                            }} />
                    </Row>
                    {this.form()}
                </Column>
            )
        });
    }

    render() {
        return (
            <Container className="justify-content-center" style={{ marginTop: 24 }}>
                {this.renderUser()}
                <ToastContainer position="bottom-right" />
            </Container>
        );
    }
}

export default CreatePage;
