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

const moment = extendMoment(Moment);
const Form = t.form.Form;

const FormSchema = t.struct({
    name: t.String,         // a required string
})

class MainPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: {
                persons: [
                    {
                        dates: [
                            {
                                startDate: new Date(),
                                endDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours(), new Date().getMinutes() + 60)
                            }
                        ],
                        id: 0
                    }
                    /*{
                      dates: [
                        {
                          startDate: new Date(),
                          endDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours(), new Date().getMinutes() + 60)
                        }
                      ],
                      id: 1
                    },
                    {
                      dates: [
                        {
                          startDate: new Date(),
                          endDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours(), new Date().getMinutes() + 60)
                        }
                      ],
                      id: 2
                    }*/
                ]
            },
            key: this.props.match.params.key,
            intersections: [],
            value: '',
            error: false
        }
        console.log(this.props.match.params.key);
    }

    errorScreen = () => {
        return (
            <div>
                <p>Sorry, empty room :(</p>
            </div>
        )
    }

    fetchPeople = async (firstfetch = true) => {
        let res = await fetch('http://localhost:3001/' + this.state.key, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'GET',
        });
        let resjson = await res.json();
        console.log(resjson)
        if(resjson.length === 0){
            this.setState({error: true})
        }
        let persons = this.state.data.persons;
        if(!firstfetch)
            persons = [persons[0]];
        console.log(persons);
        for (let i = 0; i < resjson.length; i++) {
            let dates = JSON.parse(resjson[i].dates);
            let newdates = []
            for (let j = 0; j < dates.length; j++) {
                newdates.push({ startDate: new Date(dates[j].startDate), endDate: new Date(dates[j].endDate) });
            }
            persons.push({ dates: newdates, id: i, name: resjson[i].name });
        }
        let data = { persons: persons };
        this.setState({ data: data }, () => {
            this.calculateAvailableTime();
        });
    }

    async componentDidMount() {
        await this.fetchPeople();
    }

    timeChange = (date, index, personIndex, type) => {
        let data = this.state.data;
        let objarr = data.persons[0].dates;
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
        data.persons[personIndex].dates = objarr;
        this.setState({ data: data }, () => {
            this.calculateAvailableTime();
        });
    }


    dateLists = (items, personIndex, type) => {
        return (
            items.map((item, index) => {
                return (
                    <Column>
                        <Row style={index !== 0 ? { marginBottom: 4 } : { marginBottom: 4 }} className="justify-content-center">
                            <p style={{ fontSize: 14 }}>Start Date:</p>
                            <div>
                                <DateTime
                                    value={item.startDate}
                                    timeFormat="HH:mm"
                                    dateFormat="MMMM DD, YYYY"
                                    onChange={(date) => {
                                        if (type === 'person') {
                                            alert('Cannot be edited');
                                        }
                                        else
                                            this.timeChange(date.toDate(), index, personIndex, 'start');
                                    }}
                                />
                            </div>
                        </Row>
                        <Row className="justify-content-center">
                            <p style={{ fontSize: 14 }}>End Date: </p>
                            <div style={{ marginLeft: '0.5vw' }}>
                                <DateTime

                                    value={item.endDate}
                                    timeFormat="HH:mm"
                                    dateFormat="MMMM DD, YYYY"
                                    onChange={(date) => {
                                        if (type === 'person') {
                                            alert('Cannot be edited');
                                        }
                                        else
                                            this.timeChange(date.toDate(), index, personIndex, 'end');
                                    }}
                                />
                            </div>
                        </Row>

                    </Column>
                )
            })
        );
    }


    renderPeople = () => {
        let items = this.state.data.persons.slice(1, this.state.data.persons.length);
        return items.map((item, index) => {
            return (
                <Column className="justify-content-center">
                    <p style={{ textAlign: 'center', fontSize: 28 }}>Available dates! ({item.name})</p>
                    {this.dateLists(item.dates, index, 'person')}
                </Column>
            )
        })
    }

    renderUser = () => {
        let items = [this.state.data.persons[0]];
        return items.map((item, index) => {
            return (
                <Column className="justify-content-center">
                    <p style={{ textAlign: 'center', fontSize: 28 }}>Select available dates! (User)</p>
                    {this.dateLists(item.dates, index, 'user')}
                    <Row className="justify-content-center">
                        {this.state.data.persons[index].dates.length !== 1 ?
                            <MdRemove
                                style={{ color: '#222', fontSize: 24 }}
                                onClick={() => {
                                    let data = this.state.data;
                                    let dates = data.persons[index].dates;
                                    dates.pop();
                                    data.persons[index].dates = dates;
                                    this.setState({ data: data },
                                        () => { this.calculateAvailableTime() });
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
                                data.persons[index].dates = dates;
                                this.setState({ data: data }, () => {
                                    this.calculateAvailableTime();
                                });
                            }} />
                    </Row>
                </Column>
            )
        });
    }

    calculateAvailableTime = () => {
        let persons = this.state.data.persons;
        let ranges = [];
        let min = 0;
        let max = 0;
        let perlen = persons.length;
        for (let i = 0; i < perlen; i++) {
            let date = persons[i].dates;
            let datelen = persons[i].dates.length;
            for (let j = 0; j < datelen; j++) {
                if (i === 0 && j === 0) {
                    min = date[j].startDate.getTime();
                    max = date[j].endDate.getTime();
                    continue;
                }
                if (min > date[j].startDate.getTime())
                    min = date[j].startDate.getTime();
                if (max < date[j].endDate.getTime())
                    max = date[j].endDate.getTime();
            }
        }
        let range = { start: min, end: max };
        let stepdiv = persons.length * 10000;
        let step = (max - min) / stepdiv;
        for (let a = range.start; a < range.end; a += step) {
            ranges.push({ start: a, end: a + step, occurance: 0, personid: [] });
        }
        for (let a = 0; a < ranges.length; a++) {
            let perlen = persons.length;
            for (let b = 0; b < perlen; b++) {
                let dates = persons[b].dates;
                let datelen = persons[b].dates.length;
                for (let c = 0; c < datelen; c++) {
                    if (ranges[a].start >= dates[c].startDate.getTime() && ranges[a].end <= dates[c].endDate.getTime()) {
                        ranges[a].occurance++;
                        ranges[a].personid.push(persons[b].id);
                    }
                }
            }
        }
        /*
        console.log(ranges.map((a) => {
          return ({start: moment(new Date(a.start)).format('HH:mm'), end: moment(new Date(a.end)).format('HH:mm')})
        }));
        console.log(this.normalize(ranges).map((a) => {
          return ({start: moment(new Date(a.start)).format('HH:mm'), end: moment(new Date(a.end)).format('HH:mm'), occurance: a.occurance})
        }));*/
        let normalizedranges = this.normalize(ranges, min, max);
        this.setState({ intersections: normalizedranges });
    }

    normalize = (array, min, max) => {
        let len = array.length;
        let newarr = [];
        for (let a = 0; a < len - 1; a++) {
            let firstel = array[a];
            let b = a + 1;
            let newel = { ...firstel };
            while (b < len && firstel.occurance === array[b].occurance) {    //If different persons are wanted, check the personid's
                newel.end = array[b].end;
                b++;
                a++;
                if (a > len) {
                    console.log('error');
                    return [];
                }
            }
            /* console.log((max - min) / 10 +  ' < ' + (newel.end - newel.start))
             console.log((max - min) / 10 < (newel.end - newel.start))*/
            if (newel.occurance > 1 /*&& (max - min) / 10 < (newel.end - newel.start)*/)
                newarr.push(newel);
        }
        return newarr;
    }

    intersectionsList = () => {
        let intersections = this.state.intersections;
        return intersections.map((item, index) => {
            //    console.log(new Date(item.start));
            //    console.log(new Date(item.end));
            return (
                <Column className="justify-content-center">
                    <p>People: {item.occurance}, Intersection: {moment(new Date(item.start)).format('MMMM DD, YYYY HH:mm')} - {moment(new Date(item.end)).format('MMMM DD, YYYY HH:mm')}</p>
                </Column>
            )
        });
    }

    form = () => {
        return (
            <Container style={{ marginTop: 12 }}>
                <Form
                    value={this.state.value}
                    onChange={(val) => { this.setState({ value: val }); }}
                    ref="form"
                    type={FormSchema} />
                <div className="form-group">
                        <Button onClick={async () => {
                            const value = this.refs.form.getValue();
                            if (value.name != null && value.name != undefined && value.name != '') {
                                let name = value.name;
                                let res = await fetch('http://localhost:3001/' + this.state.key, {
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                    },
                                    method: 'POST',
                                    body: JSON.stringify({ name: name, dates: this.state.data.persons[0].dates })
                                });
                                let resjson = await res.json();
                                console.log(resjson);
                                if (resjson != null) {
                                    if (resjson.success === '1') {
                                        ReactCopy('https://ibkmeetup.herokuapp.com/' /*'http://localhost:3000/'*/ + this.state.key);
                                        this.setState({ sent: true }, async () => {
                                            toast('Copied to clipboard');
                                            await this.fetchPeople(false);
                                        });
                                    }
                                }
                            }
                        }} type="submit">Save</Button>
                </div>
            </Container>
        )
    }

    render() {
        return (
            <div>
                {
                    this.state.error ?
                        this.errorScreen()
                        :
                        <Container className="justify-content-center" style={{ marginTop: 24 }}>
                            {this.renderPeople()}
                            {
                                this.state.sent ?
                                    <div></div>
                                    :
                                    this.renderUser()
                            }
                            {this.intersectionsList()}
                            {
                                this.state.sent ?
                                    <div></div>
                                    :
                                    this.form()
                            }
                            <ToastContainer position = "bottom-right" />
                        </Container>
                }
            </div>
        );
    }
}

export default MainPage;
