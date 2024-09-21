import axios from "axios";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import styles from "./stanLabu.module.css";
import { Link } from "react-router-dom";

type labItem = {
  createdAt: string;
  description: string;
  id: number;
  name: string;
  quantity: number;
  updatedAt: string;
};

type order = {
  id: number;
  userId: number;
  itemId: number;
  createdAt: string;
  orderDate: string;
  status: "string";
  ilosc: number;
};

type loan = {
  id: number;
  userId: number;
  item: labItem;
  itemId: number;
  loanDate: string;
  returnDate: string;
  status: string;
};

type tableDataType = "items" | "userLoans" | "orders" | "userOrders";

export default function StanLabu() {
  const token = localStorage.getItem("userToken");
  const isLogged = localStorage.getItem("userToken");
  const [labItems, setLabItems] = useState<labItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tableDataType, setTableDataType] = useState<tableDataType>("items");

  const getAllItem = async () => {
    try {
      const res = await axios.get("http://localhost:3000/items", {
        headers: {
          Authorization: token,
        },
        withCredentials: true,
      });
      setLabItems(() => res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const checkIfAdmin = async () => {
    try {
      const res = await axios.get("http://localhost:3000/check-admin", {
        headers: {
          Authorization: token,
        },
        withCredentials: true,
      });

      if (res.data.isAdmin) {
        setIsAdmin(res.data.isAdmin);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAllItem();
    checkIfAdmin();
  }, []);

  useEffect(() => {
    if (!isLogged) {
      window.location.href = "/loginPage";
    }
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      getAllItem();
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className={styles.stanLabu}>
      <OrderList
        tableDataType={tableDataType}
        setTableDataType={setTableDataType}
        isAdmin={isAdmin}
      />
      <div
        className={styles.midSectionContainer}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "80vw",
        }}
      >
        <Header tableDataType={tableDataType} />
        <ChangeTableData
          isAdmin={isAdmin}
          tableDataType={tableDataType}
          setTableDataType={setTableDataType}
        />

        <div
          className={styles.midSection}
          style={{ width: isAdmin ? "100%" : "100%" }}
        >
          {tableDataType === "items" ? (
            <ItemsTable labItems={labItems} isAdmin={isAdmin} />
          ) : null}

          {tableDataType === "userLoans" ? <UserLoansTable /> : null}
          {tableDataType === "orders" && isAdmin ? <AllOrdersTable /> : null}
          {tableDataType === "userOrders" ? <StudentOrdersTable /> : null}
        </div>
        {isAdmin && tableDataType === "items" ? <AddItem /> : null}
      </div>
    </div>
  );
}

const UserLoansTable = () => {
  const [loans, setLoans] = useState<loan[]>([]);

  const token = localStorage.getItem("userToken");

  const getUserLoans = async () => {
    try {
      const res = await axios.get("http://localhost:3000/user/current-loans", {
        headers: {
          Authorization: token,
        },
        withCredentials: true,
      });
      setLoans(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getUserLoans();
  }, []);

  return (
    <table
      className={styles.labItemTable}
      style={{
        width: "100%",
      }}
    >
      <thead>
        <tr>
          <th>ID Przedmiotu</th>
          <th>ID Użytkownika</th>
          <th>Data Wypożyczenia</th>
          <th>Termin Oddania</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {loans.map((item, index) => (
          <tr key={index}>
            <td>{item.itemId}</td>
            <td>{item.userId}</td>
            <td>{item.loanDate}</td>
            <td>{item.returnDate}</td>
            <td
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  backgroundColor: item.status === "active" ? "green" : "red",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                }}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const AllOrdersTable = () => {
  const [adminOrders, setAdminOrders] = useState<order[]>([]);

  const token = localStorage.getItem("userToken");

  const getAllOrders = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/admin/orders/pending`,

        {
          headers: {
            Authorization: token,
          },
          withCredentials: true,
        }
      );

      setAdminOrders(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const finilizeTheOrder = async (
    orderStatus: "accepted" | "rejected",
    orderId: number
  ) => {
    try {
      await axios.post(
        `http://localhost:3000/approve-order/${orderId}`,
        {
          status: orderStatus,
        },

        {
          headers: {
            Authorization: token,
          },
          withCredentials: true,
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAllOrders();
  }, []);
  return (
    <table
      className={styles.labItemTable}
      style={{
        width: "100%",
      }}
    >
      <thead>
        <tr>
          <th>ID Przedmiotu</th>
          <th>ID Użytkownika</th>
          <th>Data Wypożyczenia</th>
          <th>Termin Oddania</th>
          <th>Ilość</th>
          <th>Status</th>
          <th>Zaakceptuj</th>
          <th>Odrzuć</th>
        </tr>
      </thead>
      <tbody>
        {adminOrders.map((item, index) => (
          <tr key={index}>
            <td>{item.itemId}</td>
            <td>{item.userId}</td>
            <td>{item.createdAt}</td>
            <td>{item.orderDate}</td>
            <td>{item.ilosc}</td>
            <td
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item.status}
            </td>
            <td>
              <form
                onSubmit={() => {
                  finilizeTheOrder("accepted", item.id);
                }}
              >
                <button type="submit" className={styles.acceptOrderButton}>
                  Zaakceptuj
                </button>
              </form>
            </td>
            <td>
              <form
                onSubmit={() => {
                  finilizeTheOrder("rejected", item.id);
                }}
              >
                <button type="submit" className={styles.declineOrderButton}>
                  Odrzuć
                </button>
              </form>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const StudentOrdersTable = () => {
  const [studentOrders, setStudentOrders] = useState<order[]>([]);
  const token = localStorage.getItem("userToken");

  const getStudentOrders = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/student/orders`,

        {
          headers: {
            Authorization: token,
          },
          withCredentials: true,
        }
      );

      const orders = res.data;
      setStudentOrders(orders);
      setStudentOrders(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getStudentOrders();
  }, []);
  return (
    <table
      className={styles.labItemTable}
      style={{
        width: "100%",
      }}
    >
      <thead>
        <tr>
          <th>ID Przedmiotu</th>
          <th>ID Użytkownika</th>
          <th>Data Wypożyczenia</th>
          <th>Termin Oddania</th>
          <th>Ilość</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {studentOrders.map((item, index) => (
          <tr key={index}>
            <td>{item.itemId}</td>
            <td>{item.userId}</td>
            <td>{item.createdAt}</td>
            <td>{item.orderDate}</td>
            <td>{item.ilosc}</td>
            <td
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color:
                  String(item.status) === "accepted"
                    ? "green"
                    : String(item.status) === "rejected"
                    ? "red"
                    : "black",
              }}
            >
              {item.status}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const ChangeTableData = ({
  tableDataType,
  setTableDataType,
  isAdmin,
}: {
  tableDataType: tableDataType;
  setTableDataType: Dispatch<SetStateAction<tableDataType>>;
  isAdmin: boolean;
}) => {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "center",
        gap: "20px",
      }}
    >
      <button
        onClick={() => setTableDataType("items")}
        className={styles.changeTableDataButton}
        style={{
          color: tableDataType === "items" ? "#22d67d" : "white",
          border: tableDataType === "items" ? "3px solid #22d67d" : "",
        }}
      >
        Stan Labu
      </button>

      {isAdmin ? (
        <button
          onClick={() => setTableDataType("orders")}
          className={styles.changeTableDataButton}
          style={{
            color: tableDataType === "orders" ? "#22d67d" : "white",

            border: tableDataType === "orders" ? "3px solid #22d67d" : "",
          }}
        >
          Zamówienia
        </button>
      ) : null}
      <button
        onClick={() => setTableDataType("userLoans")}
        className={styles.changeTableDataButton}
        style={{
          color: tableDataType === "userLoans" ? "#22d67d" : "white",

          border: tableDataType === "userLoans" ? "3px solid #22d67d" : "",
        }}
      >
        Twoje Przedmioty
      </button>

      <button
        onClick={() => setTableDataType("userOrders")}
        className={styles.changeTableDataButton}
        style={{
          color: tableDataType === "userOrders" ? "#22d67d" : "white",

          border: tableDataType === "userOrders" ? "3px solid #22d67d" : "",
        }}
      >
        Twoje Zamówienia
      </button>
    </div>
  );
};

const Header = ({ tableDataType }: { tableDataType: tableDataType }) => {
  return tableDataType === "items" ? (
    <div className={styles.header}>
      <div>AKTUALNY</div>
      <div>STAN LABU</div>
    </div>
  ) : tableDataType === "userLoans" ? (
    <div className={styles.header}>
      <div>TWOJE</div>
      <div>WYPOŻYCZENIA</div>
    </div>
  ) : tableDataType === "orders" ? (
    <div className={styles.header}>
      <div>WSZYSTKIE</div>
      <div>ZAMÓWIENIA</div>
    </div>
  ) : tableDataType === "userOrders" ? (
    <div className={styles.header}>
      <div>TWOJE</div>
      <div>ZAMÓWIENIA</div>
    </div>
  ) : null;
};

const ItemsTable = ({
  labItems,
  isAdmin,
}: {
  labItems: labItem[];
  isAdmin: boolean;
}) => {
  const token = localStorage.getItem("userToken");
  const [isDeletingModeOn, setIsDeletingModeOn] = useState(false);
  const [loans, setLoans] = useState<loan[]>([]);
  const [itemToDelete, setItemToDelete] = useState<labItem>({
    createdAt: "",
    description: "",
    id: -1,
    name: "",
    quantity: -1,
    updatedAt: "",
  });

  const deleteItem = async (itemID: number) => {
    try {
      await axios.delete(`http://localhost:3000/items/${itemID}`, {
        headers: {
          Authorization: token,
        },
        withCredentials: true,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const getALLLoans = async () => {
    try {
      const res = await axios.get("http://localhost:3000/admin/current-loans", {
        headers: {
          Authorization: token,
        },
        withCredentials: true,
      });
      setLoans(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getALLLoans();
  }, []);

  return (
    <>
      <table
        className={styles.labItemTable}
        style={{
          width: "100%",
        }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Nazwa</th>
            <th>Ilość</th>
            <th>Dostępność</th>
            <th>Zamówienia</th>
            {isAdmin ? <th>Usuń</th> : null}
          </tr>
        </thead>
        <tbody>
          {labItems.map((item, index) => (
            <tr key={index} style={{ opacity: item.quantity === 0 ? 0.5 : 1 }}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.quantity === 0 ? "❌" : "✅"}</td>
              <td>
                <CreateOrder item={item} />
              </td>
              {isAdmin ? (
                <td
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setIsDeletingModeOn(true);
                    setItemToDelete(item);
                  }}
                >
                  ❌
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
      {isDeletingModeOn ? (
        <>
          <div
            className={styles.deletingBackground}
            onClick={() => setIsDeletingModeOn(false)}
          ></div>
          <form
            className={styles.deleteItemForm}
            onSubmit={() => deleteItem(itemToDelete.id)}
          >
            <h1 style={{ fontFamily: "Arial", color: "white" }}>
              Czy Na Pewno Chcesz Usunąć Ten Przedmiot ?
            </h1>
            <h2 style={{ margin: "0", color: "white", fontFamily: "Arial" }}>
              ID : {itemToDelete.id}
            </h2>
            <h2
              style={{
                margin: "0",
                color: "white",
                fontFamily: "Arial",
                maxWidth: "90%",
                marginLeft: "5%",
                lineBreak: "anywhere",
              }}
            >
              Nazwa : {itemToDelete.name}
            </h2>
            {/* {loans.includes(itemToDelete.id) ? <div>NICHUJAAAAAAA</div> : null}
             */}

            {loans.some((loan) => loan.itemId === itemToDelete.id) ? (
              <h2
                style={{
                  fontWeight: "bold",
                  color: "red",
                  fontFamily: "Arial",
                  backgroundColor: "white",
                  borderRadius: "10px",
                  width: "90%",
                  marginLeft: "5%",
                  padding: "1%",
                }}
              >
                Aktualnie Nie Można Usunąć Tego Przedmiotu
              </h2>
            ) : (
              <button
                type="submit"
                className={styles.acceptOrderButton}
                style={{
                  width: "180px",
                  height: "40px",
                  marginTop: "50px",
                  marginLeft: "calc(50% - 90px)",
                  marginBottom: "30px",
                  fontFamily: "Arial",
                }}
              >
                Potwierdź
              </button>
            )}

            <div
              className={styles.declineOrderButton}
              style={{
                width: "180px",
                height: "30px",
                marginLeft: "calc(50% - 90px)",
                padding: "0",
                marginBottom: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Arial",
              }}
              onClick={() => setIsDeletingModeOn(false)}
            >
              Cofnij
            </div>

            <h1
              style={{
                fontFamily: "Arial",
                color: "red",
                backgroundColor: "white",
                width: "90%",
                marginBottom: "0%",
                marginLeft: "5%",
                paddingTop: "20px",
                borderRadius: "10px 10px 0px 0px",
              }}
            >
              UWAGA !
            </h1>
            <h2
              style={{
                fontFamily: "Arial",
                color: "red",
                width: "90%",
                marginLeft: "5%",
                backgroundColor: "white",
                marginTop: "0",
                paddingBottom: "20px",
                borderRadius: "0px 0 10px 10px",
              }}
            >
              Może To Spowodować Usunięcie Zamówień Związanych Z Tym Przedmiotem
            </h2>
          </form>
        </>
      ) : null}
    </>
  );
};

const OrderList = ({
  isAdmin,
  tableDataType,
  setTableDataType,
}: {
  isAdmin: boolean;
  tableDataType: tableDataType;
  setTableDataType: Dispatch<SetStateAction<tableDataType>>;
}) => {
  const [adminOrders, setAdminOrders] = useState<order[]>([]);
  const [studentOrders, setStudentOrders] = useState<order[]>([]);
  const [listDataType, setListDataType] = useState<"menu" | "orders">("menu");
  const [user, setUser] = useState({
    id: 0,
    email: "",
    username: "",
    numer_indeksu: "",
    type: "",
  });
  const token = localStorage.getItem("userToken");

  const getAllOrders = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/admin/orders/pending`,

        {
          headers: {
            Authorization: token,
          },
          withCredentials: true,
        }
      );

      setAdminOrders(res.data);
      setStudentOrders(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getStudentOrders = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/student/orders`,

        {
          headers: {
            Authorization: token,
          },
          withCredentials: true,
        }
      );

      const orders = res.data;
      setStudentOrders(orders);
      setStudentOrders(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getUserDetails = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/me`,

        {
          headers: {
            Authorization: token,
          },
          withCredentials: true,
        }
      );

      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      getAllOrders();
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    getAllOrders();
    getStudentOrders();
    getUserDetails();
  }, []);

  return listDataType === "orders" ? (
    <div className={styles.ordersList}>
      <Link
        to="/"
        style={{ width: "130px", aspectRatio: "1/1", marginBottom: "0px" }}
      >
        <div className={styles.logo} style={{ cursor: "pointer" }}></div>
      </Link>
      <div
        style={{
          color: "white",
          fontWeight: "bold",
          fontSize: "2rem",
          fontFamily: "Arial",
        }}
      >
        {user.username}
      </div>

      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <button
          onClick={() => setListDataType("menu")}
          className={styles.changeTableDataButton}
          style={{
            color: String(listDataType) === "menu" ? "#22d67d" : "white",

            border: String(listDataType) === "menu" ? "3px solid #22d67d" : "",
            width: "40%",
          }}
        >
          Menu
        </button>

        <button
          onClick={() => setListDataType("orders")}
          className={styles.changeTableDataButton}
          style={{
            color: String(listDataType) === "orders" ? "#22d67d" : "white",

            border:
              String(listDataType) === "orders" ? "3px solid #22d67d" : "",
            width: "40%",
          }}
        >
          Zamówienia
        </button>
      </div>
      {isAdmin
        ? adminOrders.map((order, index) => (
            <Order
              refreshOrdersFetch={getAllOrders}
              key={index}
              order={order}
              isAdmin={isAdmin}
            />
          ))
        : studentOrders.map((order, index) => (
            <Order
              refreshOrdersFetch={getAllOrders}
              key={index}
              order={order}
              isAdmin={isAdmin}
            />
          ))}
      <div>
        {isAdmin && adminOrders.length === 0 ? (
          <div
            style={{ fontFamily: "Arial", color: "red", fontWeight: "Bold" }}
          >
            Brak Zamówień
          </div>
        ) : studentOrders.length === 0 ? (
          <div
            style={{ fontFamily: "Arial", color: "red", fontWeight: "Bold" }}
          >
            Brak Zamówień
          </div>
        ) : null}
      </div>
    </div>
  ) : (
    <div className={styles.ordersList}>
      <Link
        to="/"
        style={{ width: "130px", aspectRatio: "1/1", marginBottom: "0px" }}
      >
        <div className={styles.logo} style={{ cursor: "pointer" }}></div>
      </Link>
      <div
        style={{
          color: "white",
          fontWeight: "bold",
          fontSize: "2rem",
          fontFamily: "Arial",
        }}
      >
        {user.username}
      </div>

      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <button
          onClick={() => setListDataType("menu")}
          className={styles.changeTableDataButton}
          style={{
            color: String(listDataType) === "menu" ? "#22d67d" : "white",

            border: String(listDataType) === "menu" ? "3px solid #22d67d" : "",
            width: "40%",
          }}
        >
          Menu
        </button>

        <button
          onClick={() => setListDataType("orders")}
          className={styles.changeTableDataButton}
          style={{
            color: String(listDataType) === "orders" ? "#22d67d" : "white",

            border:
              String(listDataType) === "orders" ? "3px solid #22d67d" : "",
            width: "40%",
          }}
        >
          Zamówienia
        </button>
      </div>
      <SideMenuButtons
        isAdmin={isAdmin}
        tableDataType={tableDataType}
        setTableDataType={setTableDataType}
      />
    </div>
  );
};

const Order = ({
  order,
  isAdmin,
  refreshOrdersFetch,
}: {
  order: order;
  isAdmin: boolean;
  refreshOrdersFetch: () => Promise<void>;
}) => {
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const token = localStorage.getItem("userToken");

  const finilizeTheOrder = async (
    orderStatus: "accepted" | "rejected",
    orderId: number
  ) => {
    try {
      await axios.post(
        `http://localhost:3000/approve-order/${orderId}`,
        {
          status: orderStatus,
        },

        {
          headers: {
            Authorization: token,
          },
          withCredentials: true,
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={styles.orderContainer} style={{ fontFamily: "Arial" }}>
      <div className={styles.order}>
        <div
          onClick={() => setIsOrderOpen((prev) => !prev)}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Order{" " + order.id}
        </div>
      </div>
      {isOrderOpen ? (
        <div className={styles.orderInfoList}>
          <div className={styles.singleOrderInfo}>
            <div className={styles.infoHeader}>ID Użytkownika</div>
            <div>{JSON.stringify(order.userId)}</div>
          </div>
          <div className={styles.singleOrderInfo}>
            <div className={styles.infoHeader}>ID Przedmiotu</div>
            <div>{JSON.stringify(order.itemId)}</div>
          </div>
          <div className={styles.singleOrderInfo}>
            <div className={styles.infoHeader}>Ilość</div>
            <div>{JSON.stringify(order.ilosc)}</div>
          </div>
          <div className={styles.singleOrderInfo}>
            <div className={styles.infoHeader}>Data Wypożyczenia</div>
            <div>{order.createdAt}</div>
          </div>
          <div className={styles.singleOrderInfo}>
            <div className={styles.infoHeader}>Data Zwrotu</div>
            <div>{order.orderDate}</div>
          </div>
          <div className={styles.singleOrderInfo}>
            <div className={styles.infoHeader}>Status</div>
            <div
              style={{
                color: String(order.status) === "rejected" ? "red" : "white",
                fontWeight: "bold",
              }}
            >
              {order.status.toUpperCase()}
            </div>
          </div>
          {isAdmin ? (
            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              <form
                onSubmit={() => {
                  finilizeTheOrder("accepted", order.id);
                  refreshOrdersFetch();
                }}
              >
                <button type="submit" className={styles.acceptOrderButton}>
                  Zaakceptuj
                </button>
              </form>
              <form onSubmit={() => finilizeTheOrder("rejected", order.id)}>
                <button type="submit" className={styles.declineOrderButton}>
                  Odrzuć
                </button>
              </form>
            </div>
          ) : null}

          <div
            className={styles.rollUpButton}
            onClick={() => setIsOrderOpen(false)}
          >
            Zwiń ▲
          </div>
        </div>
      ) : null}
    </div>
  );
};

const CreateOrder = ({ item }: { item: labItem }) => {
  const [chosenQuantity, setChosenQuantity] = useState(1);
  const token = localStorage.getItem("userToken");

  const decreaseQuantity = () => {
    if (chosenQuantity > 1) {
      setChosenQuantity((prev) => prev - 1);
    }
  };

  const increaseQuantity = () => {
    if (chosenQuantity < item.quantity) {
      setChosenQuantity((prev) => prev + 1);
    }
  };

  const createNewOrder = async (itemId: number) => {
    try {
      await axios.post(
        `http://localhost:3000/orders`,
        {
          itemId,
          ilosc: chosenQuantity,
        },
        {
          headers: {
            Authorization: token,
          },
          withCredentials: true,
        }
      );

      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      className={styles.orderCreator}
      style={{ display: item.quantity === 0 ? "none" : "" }}
    >
      <div
        onClick={decreaseQuantity}
        style={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          color: "red",
        }}
      >
        ➖
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        {chosenQuantity}
      </div>
      <div
        onClick={increaseQuantity}
        style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
      >
        ➕
      </div>
      <form onSubmit={() => createNewOrder(item.id)}>
        <button type="submit" className={styles.confirmOrder}>
          ✓
        </button>
      </form>
    </div>
  );
};

const AddItem = () => {
  const [isAdding, setIsAdding] = useState(false);
  const token = localStorage.getItem("userToken");
  const [newItem, setNewItem] = useState<labItem>({
    createdAt: "",
    description: "",
    id: -1,
    name: "",
    quantity: -1,
    updatedAt: "",
  });

  const AddNewItem = async () => {
    if (newItem.name != "" && newItem.quantity > -1) {
      try {
        await axios.post(
          "http://localhost:3000/items",
          {
            name: newItem.name,
            quantity: newItem.quantity,
            description: newItem.description,
          },
          {
            headers: {
              Authorization: token,
            },
            withCredentials: true,
          }
        );
      } catch (err) {
        console.log(err);
      }
    }
  };
  return (
    <div className={styles.newItemContainer}>
      <div>
        {!isAdding ? (
          <div
            onClick={() => setIsAdding(true)}
            className={styles.addItemButton}
          >
            Dodaj Przedmiot +
          </div>
        ) : null}
        {isAdding ? (
          <form className={styles.addItemForm} onSubmit={AddNewItem}>
            <input
              type="number"
              min={0}
              placeholder="Ilość"
              onChange={(e) =>
                setNewItem((prev) => ({
                  ...prev,
                  quantity: Number(e.target.value),
                }))
              }
            />
            <input
              type="string"
              placeholder="Nazwa"
              onChange={(e) =>
                setNewItem((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
            <input
              type="string"
              placeholder="Opis (opcjonalnie)"
              onChange={(e) =>
                setNewItem((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
            <button type="submit">Dodaj</button>
            <div
              onClick={() => setIsAdding(false)}
              className={styles.cancelButton}
            >
              Anuluj
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
};

const SideMenuButtons = ({
  tableDataType,
  setTableDataType,
  isAdmin,
}: {
  tableDataType: tableDataType;
  setTableDataType: Dispatch<SetStateAction<tableDataType>>;
  isAdmin: boolean;
}) => {
  return (
    <div className={styles.sideMenyButtons}>
      <button
        className={styles.order}
        style={{
          height: "75px",
          width: "95%",

          color: tableDataType === "items" ? "#22d67d" : "white",
          border:
            tableDataType === "items" ? "3px solid #22d67d" : "3px solid gray",
        }}
        onClick={() => setTableDataType("items")}
      >
        Stan Labu
      </button>
      {isAdmin ? (
        <button
          className={styles.order}
          style={{
            height: "75px",
            width: "95%",

            color: tableDataType === "orders" ? "#22d67d" : "white",
            border:
              tableDataType === "orders"
                ? "3px solid #22d67d"
                : "3px solid gray",
          }}
          onClick={() => setTableDataType("orders")}
        >
          Zamówienia
        </button>
      ) : null}

      <button
        className={styles.order}
        style={{
          height: "75px",
          width: "95%",

          color: tableDataType === "userLoans" ? "#22d67d" : "white",
          border:
            tableDataType === "userLoans"
              ? "3px solid #22d67d"
              : "3px solid gray",
        }}
        onClick={() => setTableDataType("userLoans")}
      >
        Twoje Przedmioty
      </button>

      <button
        className={styles.order}
        style={{
          height: "75px",
          width: "95%",

          color: tableDataType === "userOrders" ? "#22d67d" : "white",
          border:
            tableDataType === "userOrders"
              ? "3px solid #22d67d"
              : "3px solid gray",
        }}
        onClick={() => setTableDataType("userOrders")}
      >
        Twoje Zamówienia
      </button>
    </div>
  );
};
