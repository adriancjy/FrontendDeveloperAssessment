import React from 'react';
import './App.css';
import { useFilters, useTable } from "react-table"
import { Item } from './type';
import moment from 'moment';
import '../node_modules/font-awesome/css/font-awesome.min.css'; 
import { DatePicker } from 'antd';

export function capsFirst(word: string){
  const firstLetter = word.charAt(0).toUpperCase();
  const remaining = word.slice(1);
  return firstLetter + remaining;
}

export function getCurrentDT() {
  const format = "YYYY-MM-DD HH:mm:ss";
  const date = new Date();
  const current = moment(date).format(format);
  return current;
}

export async function addItemToDB(data: any[], payload: { [x: string]: any; }) {
  const reversed = data.reverse();
  const newId = (parseInt(reversed[0]['id']) + 1).toString();
  const bodyToPost = {
    "id": newId,
    "name": payload['name'],
    "category": payload['category'],
    "price": payload['price'],
    "quantity": payload['quantity'],
    "last_updated_dt": getCurrentDT()
  }
  let resp = await fetch("/items", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyToPost)
  })
  let respToJson = await resp.json()
  return respToJson
}

export async function editItemInDB(payload: { [x: string]: any; }) {
  const bodyToPut = {
    "id": payload["id"],
    "name": payload["name"],
    "category": payload["category"],
    "price": payload["price"],
    "quantity": payload["quantity"],
    "last_updated_dt": getCurrentDT()
  }
  let resp = await fetch(`/items/${payload["id"]}`, {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyToPut)
  })
  let respToJson = await resp.json()
  return respToJson
}

export function startDateChange(date: any, dateString: string|string[]) {
  if (typeof dateString === "string") {
    if (dateString.trim() === ""){
      return null
    } else {
    date = new Date(dateString)
    date.setHours(0,0,0,0)
    return date
    }
  }
}

export function endDateChange(date: any, dateString: string|string[]) {
  if (typeof dateString === "string") {
    if (dateString.trim() === ""){
      return null
    } else {
    date = new Date(dateString)
    date.setHours(0,0,0,0)
    return date
  }
}
}

function App() {

  const [itemData, setItemData] = React.useState<Item[]>([]);
  const [data, setData] = React.useState<Item[]>([]);
  const [columns, setColumn] = React.useState<any[]>([]);
  const [name, setName] = React.useState<string>("");
  const [category, setCategory] = React.useState<string>("");
  const [price, setPrice] = React.useState<string>("");
  const [quantity, setQuantity] = React.useState<number>(0);
  const [id, setId] = React.useState<number>(0);
  const [addBtnClick, setAddbtnClick] = React.useState<Boolean>(false);
  const [startDate, setStartDate] = React.useState<any>(null);
  const [endDate, setEndDate] = React.useState<any>(null);

  const tableInstance = useTable({columns,data}, useFilters)

  function handleEdit(value: any) {
    var modal = document.getElementById("myModal");
    modal!.style.display = "block";
    const payload = value;
    setName(payload['name'])
    setCategory(payload['category'])
    setPrice(payload['price'])
    setQuantity(payload['quantity'])
    setId(payload['id'])
  }


  function editItem(event: any) {
    event.preventDefault();
    const bodyToPut = {
      "id": id,
      "name": name,
      "category": category,
      "price": price,
      "quantity": quantity,
      "last_updated_dt": getCurrentDT()
    }
    editItemInDB(bodyToPut)
    .then((d) => {
      setAddbtnClick(false);
      alert("Item edited successfully")
      window.location.reload()
    })
    .catch((e) => {
      setAddbtnClick(false);
      alert("Error in editing item")
      window.location.reload()
    })
  }

  function addItem(event: any) {
    event.preventDefault();
    addItemToDB(data, {
      "name": name,
      "category": category,
      "price": price,
      "quantity": quantity,
    })
    .then((d) => {
      setAddbtnClick(false);
      alert("Item added successfully")
      window.location.reload()
    })
    .catch((e) => {
      setAddbtnClick(false);
      alert("Error in adding item")
      window.location.reload()
    })
  }

  function showModal(){
    var modal = document.getElementById("myModal");
    modal!.style.display = "block";
    setAddbtnClick(true);
  }

  function resetState() {
    setName("")
    setCategory("")
    setPrice("")
    setQuantity(0)
    setId(0)
  }

  function closeModal() {
    var modal = document.getElementById("myModal");
    modal!.style.display = "none";
    resetState()
    setAddbtnClick(false);
  }

  function onNameChange(e: React.FormEvent<HTMLInputElement>) {
    setName(e.currentTarget.value);
  }

  function onCategoryChange(e: React.FormEvent<HTMLInputElement>) {
    setCategory(e.currentTarget.value);
  }
  function onPriceChange(e: React.FormEvent<HTMLInputElement>) {
    setPrice(e.currentTarget.value);
  }
  function onQuantityChange(e: React.FormEvent<HTMLInputElement>) {
    setQuantity(parseInt(e.currentTarget.value));
  }

  function onStartDateChanged(date: any, dateString: string|string[]) {
    setStartDate(startDateChange(date, dateString))
  }
  // dateString.trim() === "" ? setStartDate(null) : setStartDate(new Date(dateString))
    
  function onEndDateChanged(date: any, dateString: string|string[]) {
    setEndDate(endDateChange(date, dateString))
  }

  React.useEffect(() => {
    if (startDate !== null && endDate !== null) {
      let filtered: any[] = [];
      let copied = data;
      copied.filter(d => {
        let d_format = new Date(d['last_updated_dt'])
        d_format.setHours(0,0,0,0)
        if (startDate <= d_format && d_format <= endDate){
          filtered.push(d)
        }
      })
      setData(filtered);
    } else if (startDate === null && endDate === null) {
      setData(itemData);
    }
  }, [startDate, endDate])

  React.useEffect(() => {
    fetch("/items", {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    .then(d => d.json())
    .then(result => {
      setItemData(result)
      setData(result)
      let columns: Object[] = [];
      Object.keys(result[0]).map(word => {
        let obj: Object = {
          Header: capsFirst(word),
          accessor: word
         }
       columns.push(obj);
      })
      columns.push({
        Header: 'Edit',
        accessor: 'edit',
        Cell: (row: { row: { original: any; }; }) => (
          <div>
             <button onClick={e=> handleEdit(row.row.original)}>Edit</button>
          </div>
        )
      })
      setColumn(columns);
    })
    .catch(e => alert("Error in fetching item!"))
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>Frontend Developer Assessment</h1>
        <span>Date Filter: <DatePicker onChange={onStartDateChanged}/> to <DatePicker onChange={onEndDateChanged}/></span>
        <table {...tableInstance.getTableProps()}>
          <thead>
            {
              tableInstance.headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps()}>
                        {column.render('Header')}
                    </th>
                ))}
            </tr>
              ))
            }
          </thead>
          <tbody {...tableInstance.getTableBodyProps()}>
                    {tableInstance.rows.map((row) => {
                        tableInstance.prepareRow(row);
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map((cell) => {
                                    return (
                                        <td {...cell.getCellProps()}>
                                            {cell.render('Cell')}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
        </table>
        <button className="myBtn" onClick={showModal}>Add item</button>
        <div id="myModal" className="modal">
            <div className="modal-content">
            <span className="close" onClick={closeModal}>X</span>
            <h2>{addBtnClick ? "Add new Item" : "Edit Item"}</h2>
            <form onSubmit={addBtnClick ? addItem : editItem}>
              <label>Name: <input type="text" name="name" value={name} onChange={onNameChange}/></label>
              <br/>
              <label>Category: <input type="text" name="category" value={category} onChange={onCategoryChange}/></label>
              <br/>
              <label>Price: <input type="text" name="price" value={price} onChange={onPriceChange}/></label>
              <br/>
              <label>Quantity: <input type="number" name="quantity" value={quantity} onChange={onQuantityChange}/></label>
              <br/>
              <input type="submit" value="Submit Item"/>
            </form>
            </div>
          </div>
      </header>
    </div>
  );
}

export default App;
