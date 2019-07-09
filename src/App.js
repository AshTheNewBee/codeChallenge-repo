import React from 'react';
import Tree from 'react-d3-tree';
import './App.css';

const  positions = { CEO: 'CEO', MANAGER: 'Manager', STAFF:'Staff'}

export default class App extends React.Component{
  
  state = {
    empArr: [
      { name: 'Alan', id: 100, managerId: 150, position: positions.MANAGER},
      { name: 'Martin', id: 220, managerId:100,  position: positions.STAFF},
      { name: 'Jamie', id: 150, position: positions.CEO },
      { name: 'Alex', id: 275, managerId:100, position: positions.STAFF },
      { name: 'Steve', id: 400, managerId:150, position: positions.MANAGER },
      { name: 'David', id: 190, managerId:400, position: positions.STAFF},
      
      // //Test Data
      // { name: 'InvalidManager', id: '190', managerId:365, position: positions.MANAGER},
      // { name: 'InvalidSTAFF', id: '123', position: positions.STAFF, managerId: 100},
      // { name: 'NoPositions', id: '111', managerId: 400},
      // { name: 'NoManager', id: 190, position: positions.STAFF }
    ],
    d3Data: [],
    managersArr: [],
    completeTreeData: []
  }

  /*********************************
   * @componentDidMount
   *    Call @getCEO_ManagerData which returns a promise and call @getStaff() asynchronosely
   *********************************/
  
  componentDidMount(){
    this.getCEO_ManagerData().then((managerData => {
      this.getStaff().then(() => {
        // console.log(this.state.d3Data)
      })
    }))
  }

  /*********************************
   * @getCEO_ManagerData
   *    d3TreeDataStruct is the full structure of the emp hiearchy data set that passes to react-d3-tree
   *    empData is filters by positions of ceo & manager then update the d3Data state with hieracheal data 
   *    (Creates invalid managers with a special note concat to the manager name)
   * @returns
   *    promise resolve: sets the state of d3Data with CEO & Manager data
   *    promise reject: returns an error message
   *********************************/
  getCEO_ManagerData = () => {
    return new Promise((resolve, reject) => {
      try{
        const empData = this.state.empArr;
        let d3TreeDataStruct = [
          {
            name: '',
            attributes: {
             
            },
            children: [
              
            ],
          },
        ];

        empData.forEach(emp => {
        if(emp.position === positions.CEO){
          d3TreeDataStruct[0].name = emp.name;
          d3TreeDataStruct[0].attributes= {
            position: emp.position,
            id: emp.id,
          }
          }else if(emp.position === positions.MANAGER){
            if(Number.isInteger(emp.id)){
              d3TreeDataStruct[0].children.push({
                name: emp.name,
                attributes: {
                  position: emp.position,
                  id: emp.id
                },
                children: []
              })
            }else{
              d3TreeDataStruct[0].children.push({
                name: `${emp.name} | *** Invalid Manager ***`,
                attributes: {
                  position: emp.position,
                  id: emp.id
                },
                children: []
              })
            }
            
          }else if(emp.position !== positions.STAFF){
            
            d3TreeDataStruct[0].children.push(
              {
              name: `${emp.name} | *** Positions to be created ***`,
              attributes: {
                position: 'null',
                id: emp.id
              },
              children: []
            }
            )
          }
        })

        resolve(this.setState({ d3Data: d3TreeDataStruct }));
      }catch(e){
        reject('Error occured while retrieving CEO & Manager Data')
      }
    })
    
  }
  
  returnStructObj = (name, position, id, note = '') => {
    return {
      name: `${name} | *** Positions to be created ***`,
      attributes: {
        position: position,
        id: id
      },
      children: []
    }
  }
  /*********************************
   * @getStaff
   *    empData is filters by positions of Staff then compare the staff managerId with managerId
   *    if staff manager id matches with any exisiting manager's employee id, it will add this 
   *      staff to childen array of that manager's index
   *    sets the completeTreeData with all d3Data that's been updated.
   * 
   * @returns
   *    promise resolve: sets the state of d3Data with staff data
   *    promise reject: returns an error message
   *********************************/
  getStaff = () => {
    return new Promise((resolve, reject) => {
      try{
        let d3Data = this.state.d3Data
        console.log(d3Data)
        this.state.empArr.forEach(emp => {
          
          
          if(emp.position === positions.STAFF){
            if(!emp.managerId){
              console.log(emp.name)
              d3Data[0].children.push({
                name: `${emp.name} | *** Managers to be allocated ***`,
                attributes: {
                  position: emp.position,
                  id: emp.id,
                  note: 'Invalid ID'
                }
              })
            }else{
              for(let i = 0; i < d3Data[0].children.length; i++){
                let managers = d3Data[0].children
                if(managers[i]){
                  if( emp.managerId === managers[i].attributes.id && Number.isInteger(emp.id)){
                    managers[i].children.push({
                      name: emp.name,
                      attributes: {
                        position: emp.position,
                        id: emp.id
                      }
                    })
                  }else if (emp.managerId === managers[i].attributes.id && !Number.isInteger(emp.id)){
                    managers[i].children.push({
                      name: `${emp.name} | *** Invalid Staff ***`,
                      attributes: {
                        position: emp.position,
                        id: emp.id,
                        note: 'Invalid ID'
                      }
                    })
                  }
                }
              }
            }
          }
        }) 
        resolve(this.setState({ d3Data: d3Data, completeTreeData: d3Data }))
      }catch(e){
        reject('error occured while retrieving staff data')
      }
    })
  }

  /*********************************
   * @render
   * Renders the hierachial tree with the employee data from completeTreeData state
   *********************************/

  render(){
    return (
      <div className="App">
          <h1> Hierarchical Relationship Of Employees</h1>
          <div id="treeWrapper" style={{width: '500em', height: '735em', transform: 'translate(184, 138) scale(1, 1) !important'

        }}>
           { 
             this.state.completeTreeData.length > 0 ? 
             <Tree 
              data = { this.state.completeTreeData } 
              zoomable={true}
              scaleExtent={{min: 1, max: 3}}
              pathFunc='elbow'
              allowForeignObjects={true}
              translate={{x:200, y: 350}}
             /> 
             : <p> Data not availible </p>
            }
          </div>
      </div>
    );
  }
}


