import { createContext, useContext, useState } from "react";


import { getNextInvoiceNoAsync } from "../../services/invoice/invoice";

import {
  ProductInterface,
  RateTypeInterface,
} from "../../services/products/products.types";


import { StationMasterInterface } from "../../services/stationMaster/stationMaster.types";

import { useAuth } from "../Auth/Auth";
import { ApiContextInterface, ApiProviderInterface } from "./Api.types";

import { TruckNumberInterface } from "../../services/truckMaster/truckMaster.type";

import { RateMasterInterface } from "../../services/rateMaster/rateMaster.type";

import { GodownMasterInterface } from "../../services/godownMaster/godownMaster.types";

import { CompanyMasterInterface } from "../../services/companyMaster/companyMaster.type";

import { UserMasterIneterface } from "../../services/user/user.types";

import { useApiStore } from "../StoreApi/StoreApi";

import {LevyMasterInterface} from "../../services/levyMaster/levyMaster.types"

const ApiContext = createContext<ApiContextInterface | undefined>(undefined);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApiContext must be used within an ApiProvider");
  }
  return context;
};

export const ApiProvider = ({ children }: ApiProviderInterface) => {
  const { handleLogout } = useAuth();

  // -----------------------------------------------------------------

  const {
    StoreProducts,
    StoreRateTypes,
	StoreStation,
	StoreTruckNumber,
	StoreRateList,
	StoreGodownList,
	StoreUserList,
	StoreUserTypeList,
	StoreCompanyList,
  StoreLevyList,


    getStoreAllProducts,
    getStoreRateTypes,
	getStoreStations,
	getStoreTruckNumbers,
	getStoreRateList,
	getStoreGodownList,
	getStoreUserList,
	getStoreUserTypeList,
	getStoreCompanyList,
  getStoreLevyList,


    setStoreProducts,
    setStoreRateTypes,
	setStoreStations,
	setStoreTruckNumbers,
	setStoreRateList,
	setStoreGodownList,
	setStoreUserList,
	setStoreUserTypeList,
	setStoreCompanyList,
  setStoreLevyList,
  } = useApiStore();

  //--------------------------------------------------------------

  const [nextInvoiceNo, setNextInvoiceNo] = useState<number>(0);

  
  
  
  



  const getAllProducts = async () => {
    if (StoreProducts.length !== 0) {
      return StoreProducts;
    } else {
      try {
        const fetchedProducts = await getStoreAllProducts();

        return fetchedProducts;
      } catch (error) {
        console.error("Error fetching All product:", error);
        handleLogout();
        return [];
      }
    }
  };

  const setAllProducts = (
    newAllProducts:
      | ProductInterface[]
      | ((prev: ProductInterface[]) => ProductInterface[])
  ) => {
    setStoreProducts(newAllProducts);
  };

  //--------------------------------------------------------------------------------

  const getRateTypes = async () => {
    if (StoreRateTypes.length !== 0) {
      return StoreRateTypes;
    } else {
      try {
        const fetchedRateTypes = await getStoreRateTypes();
        return fetchedRateTypes;
      } catch (error) {
        console.error("Error fetching rate types:", error);
        handleLogout();
        return [];
      }
    }
  };

  const setRateType = (
    newRateTypes:
      | RateTypeInterface[]
      | ((prev: RateTypeInterface[]) => RateTypeInterface[])
  ) => {
    setStoreRateTypes(newRateTypes);
  };

  // ---------------------------------------------------------------------------------------------------------

  const getNextInvoiceNo = async () => {
    if (nextInvoiceNo !== 0) {
      return nextInvoiceNo;
    } else {
      const response = await getNextInvoiceNoAsync();
      if (
        response &&
        typeof response !== "boolean" &&
        response.data.status !== 401
      ) {
        const data: number = response.data.data;
        setNextInvoiceNo(data);
        return data;
      } else {
        handleLogout();
        return 0;
      }
    }
  };

  // -----------------------------------------------------------------------------------------------------------------------

  const getStationList = async () => {
	if (StoreStation.length !== 0) {
	  return StoreStation;
	} else {
	  try {
		const fetchedStations = await getStoreStations();
		return fetchedStations;
	  } catch (error) {
		console.error("Error fetching station list:", error);
		handleLogout();
		return [];
	  }
	}
  };
  
  const setStationList = (
	newStationList:
	  | StationMasterInterface[]
	  | ((prev: StationMasterInterface[]) => StationMasterInterface[])
  ) => {
	setStoreStations(newStationList);
  };

 // ------------------------------------------------------------------------------------------------------------------------
 const getTruckList = async () => {
	if (StoreTruckNumber.length !== 0) {
	  return StoreTruckNumber;
	} else {
	  try {
		const fetchedTruckList = await getStoreTruckNumbers();
		return fetchedTruckList;
	  } catch (error) {
		console.error("Error fetching truck list:", error);
		handleLogout();
		return [];
	  }
	}
  };
  
  const setTruckList = (
	newTruckList:
	  | TruckNumberInterface[]
	  | ((prev: TruckNumberInterface[]) => TruckNumberInterface[])
  ) => {
	setStoreTruckNumbers(newTruckList);
  };

  // ----------------------------------------------------------------------


  const getRateList = async () => {
	if (StoreRateList.length !== 0) {  
	  return StoreRateList;
	} else {
	  try {
		const fetchedRateList = await getStoreRateList(); 
		return fetchedRateList;
	  } catch (error) {
		console.error("Error fetching rate list:", error);
		handleLogout();
		return [];
	  }
	}
  };
  
  const setRateList = (
	newRateList:
	  | RateMasterInterface[]
	  | ((prev: RateMasterInterface[]) => RateMasterInterface[])
  ) => {
	setStoreRateList(newRateList); 
  };

  // --------------------------------------------------------------------------

  const getGodownList = async () => {
	if (StoreGodownList.length !== 0) { 
	  return StoreGodownList;
	} else {
	  try {
		const fetchedGodownList = await getStoreGodownList(); 
		return fetchedGodownList;
	  } catch (error) {
		console.error("Error fetching godown list:", error);
		handleLogout();
		return [];
	  }
	}
  };
  
  const setGodownList = (
	newGodownList:
	  | GodownMasterInterface[]
	  | ((prev: GodownMasterInterface[]) => GodownMasterInterface[])
  ) => {
	setStoreGodownList(newGodownList); 
  };
  // ----------------------------------------------------------------------------------------------------------

  const getCompanyList = async () => {
    if (StoreCompanyList.length !== 0) {
      return StoreCompanyList;
    } else {
      try {
        const fetchedCompanyList = await getStoreCompanyList();
        return fetchedCompanyList;
      } catch (error) {
        console.error("Error fetching company list:", error);
        handleLogout();
        return [];
      }
    }
};

const setCompanyList = (
    newCompanyList:
      | CompanyMasterInterface[]
      | ((prev: CompanyMasterInterface[]) => CompanyMasterInterface[])
) => {
    setStoreCompanyList(newCompanyList);
};

// ----------------------------------------------------------------------------------------------------------

const getUserTypeList = async () => {
	if (StoreUserTypeList.length !== 0) {
	  return StoreUserTypeList;
	} else {
	  try {
		const fetchedUserTypeList = await getStoreUserTypeList();
		return fetchedUserTypeList;
	  } catch (error) {
		console.error("Error fetching user type list:", error);
		handleLogout();
		return [];
	  }
	}
  };
  
  const setUserTypeList = (
	newUserTypeList:
	  | UserMasterIneterface[]
	  | ((prev: UserMasterIneterface[]) => UserMasterIneterface[])
  ) => {
	setStoreUserTypeList(newUserTypeList);
  };

  // ----------------------------------------------------------------------------------------------------------

  const getUserList = async () => {
	if (StoreUserList.length !== 0) {
	  return StoreUserList;
	} else {
	  try {
		const fetchedUserList = await getStoreUserList();
		return fetchedUserList;
	  } catch (error) {
		console.error("Error fetching user list:", error);
		handleLogout();
		return [];
	  }
	}
  };
  
  const setUserList = (
	newUserList:
	  | UserMasterIneterface[]
	  | ((prev: UserMasterIneterface[]) => UserMasterIneterface[])
  ) => {
	setStoreUserList(newUserList);
  };

  // ----------------------------------------------------------------------------------------------------------

  const getLevyList = async () => {
	if (StoreLevyList.length !== 0) {
	  return StoreLevyList;
	} else {
	  try {
		const fetchedLevyList = await getStoreLevyList();
		return fetchedLevyList;
	  } catch (error) {
		console.error("Error fetching levy list:", error);
		handleLogout();
		return [];
	  }
	}
  };
  
  const setLevyList = (
	newLevyList:
	  | LevyMasterInterface[]
	  | ((prev: LevyMasterInterface[]) => LevyMasterInterface[])
  ) => {
	setStoreLevyList(newLevyList);
  };

  return (
    <ApiContext.Provider
      value={{
        getAllProducts,
        getRateTypes,
        getNextInvoiceNo,
        getStationList,
        getTruckList,
        getRateList,
        getGodownList,
        getCompanyList,
        getUserTypeList,
        getUserList,
        getLevyList,


		StoreProducts,
		StoreRateTypes,
		StoreStation,
		StoreTruckNumber,
		StoreRateList,
		StoreGodownList,
		StoreUserList,
		StoreUserTypeList,
		StoreCompanyList,
    StoreLevyList,


        setNextInvoiceNo,
        setRateType,
        setAllProducts,
        setStationList,
        setTruckList,
        setRateList,
        setGodownList,
        setCompanyList,
        setUserTypeList,
        setUserList,
        setLevyList,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};
