
package main


import (
	"bytes"
	"encoding/json"
    "fmt"
	"strconv"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)



// Define the Smart Contract structure
type SupplyChain struct {
}

// Define the car structure, with 4 properties.  Structure tags are used by encoding/json library
type Product struct {
   
    Pname string `json:"pname"`
	PID  string `json:"pid"`
	MfDate string `json:"mfdate"`
	MfCompany  string `json:"mfcompany"`
	Location string `json:"location"`
	Quantity int `json:"quantity"`
	VerifyBy string `json:"verifyBy"`
	VerifyON time.Time     
}

func (s *SupplyChain) Init(stub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}


func (s *SupplyChain) Invoke(stub shim.ChaincodeStubInterface) sc.Response {

	function, args := stub.GetFunctionAndParameters()

	fmt.Println("i function ", function)
	fmt.Println("args is ", args)



	if function == "register" {
		return s.register(stub, args)
	} else if function == "initLedger" {
		return s.initLedger(stub)
	} else if function == "Allproducts" {
		return s.Allproducts(stub)
	} else if function == "search" {
		return s.productS(stub, args)
	} else if function == "history" {
		return s.getHistory(stub, args)
	} 
	return shim.Error("Invalid Smart Contract function name.")
}




func (s *SupplyChain) initLedger(stub shim.ChaincodeStubInterface) sc.Response {
	prod := []Product{
		Product{Pname: "milk", PID: "01", MfDate: "21/6/1995", MfCompany: "sopra", Location: "noida 135", Quantity: 50},
		Product{Pname: "paneer", PID: "02", MfDate: "21/12/1990", MfCompany: "steria", Location: "noida 63", Quantity: 63},
		Product{Pname: "dahi", PID: "03", MfDate: "21/12/1590", MfCompany: "google", Location: "noida 603", Quantity: 3},

	}

	i := 0
	for i < len(prod) {
		fmt.Println("i is ", i)
		carAsBytes, _ := json.Marshal(prod[i])
		stub.PutState("PRODUCT"+strconv.Itoa(i), carAsBytes)
		fmt.Println("Added", prod[i])
		i = i + 1
	}

	return shim.Success(nil)
}


func (s *SupplyChain) register(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	fmt.Println("args[1]", args[1])
	  var product Product
	  err := json.Unmarshal([]byte(args[1]), & product)
	  fmt.Println("unmarshal error is", err)

	  a, err := json.Marshal(product)
	  if err != nil {  
        return shim.Success([]byte(args[1]))
		}
		fmt.Println("a is", a)

	errr:=stub.PutState(product.PID, a)
	if errr != nil {
		return shim.Error("Failed to create asset " + product.PID)
	   }
	  return shim.Success([]byte("Asset modified."))
}



func (s *SupplyChain) Allproducts(stub shim.ChaincodeStubInterface) sc.Response {

	startKey := "PRODUCT0"
	endKey := "PRODUCT999"

	resultsIterator, err := stub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString("")
		}
		buffer.WriteString("\n")
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\n")
		buffer.WriteString("\"Record\":")
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		buffer.WriteString("\n")

		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("Allproducts are :\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}


func (s *SupplyChain) productS(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	 var buffer bytes.Buffer
	 buffer.WriteString("\n")

	pAsJSONBytes, _ := stub.GetState(args[0])
	fmt.Printf("%s", pAsJSONBytes)
	buffer.WriteString("\n")
	buffer.WriteString("\n")

	buffer.WriteString("\n")
	return shim.Success([]byte(pAsJSONBytes))

}

func (t *SupplyChain) getHistory(stub shim.ChaincodeStubInterface, args []string) sc.Response {

    if len(args) < 1 {
            return shim.Error("Incorrect number of arguments. Expecting 1")
    }

    ufoId := args[0]
    resultsIterator, err := stub.GetHistoryForKey(ufoId)
    if err != nil {
            return shim.Error(err.Error())
    }
    defer resultsIterator.Close()

    var buffer bytes.Buffer
    buffer.WriteString("[")

    bArrayMemberAlreadyWritten := false
    for resultsIterator.HasNext() {
            response, err := resultsIterator.Next()
            if err != nil {
                    return shim.Error(err.Error())
            }
            // Add a comma before array members, suppress it for the first array member
            if bArrayMemberAlreadyWritten == true {
                    buffer.WriteString(",")
            }
            buffer.WriteString("\n{\nTxId\":")
            buffer.WriteString("\"")
            buffer.WriteString(response.TxId)
			buffer.WriteString("\n")
			buffer.WriteString("\n")
			buffer.WriteString("\"Value\":")
			buffer.WriteString("\n")

			
            if response.IsDelete {
                    buffer.WriteString("null")
            } else {
                    buffer.WriteString(string(response.Value))
            }
            buffer.WriteString(",\n")
            buffer.WriteString("\"Timestamp\":")
            buffer.WriteString("\"")
			buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String())
			buffer.WriteString("\n")

			buffer.WriteString("\n")
			buffer.WriteString("\n,")

            buffer.WriteString(" \"IsDelete\":")
            buffer.WriteString("\"")
            buffer.WriteString(strconv.FormatBool(response.IsDelete))
            buffer.WriteString("\"")
			buffer.WriteString("\n")
			buffer.WriteString("}")
			buffer.WriteString("\n")

            bArrayMemberAlreadyWritten = true
    }

    fmt.Printf("\n PRODUCT HISTORY:-\n%s\n", buffer.String())
	return shim.Success(buffer.Bytes())
}

func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SupplyChain))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
		
	}
}