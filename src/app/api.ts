
enum Api {
    
    GetNextInvoiceNoAsync = '/api/Invoice/GetNextInvoiceNoAsync',
    CreateInvoiceAsync = '/api/Invoice/CreateInvoiceAsync',
    UpdateInvoiceAsync = '/api/Invoice/UpdateInvoiceAsync',
    DeleteInvoiceAsync = '/api/Invoice/DeleteInvoiceAsync',
    GetInvoiceByInvoiceNo ='/api/Invoice/GetInvoiceByInvoiceNoAsync',


    InsertProductAsync = '/api/Product/InsertProductAsync',
    UpdateProductAsync = '/api/Product/UpdateProductAsync',
    DeleteProductAsync = '/api/Product/DeleteProductAsync',
    GetAllProductsAsync = '/api/Product/GetAllProductsAsync',
    GetProduct = '/api/Product/GetProduct',

    GetRateTypeAsync = '/api/Product/GetRateTypeAsync',

    
    CreateStationAsync = '/api/Station/CreateStationAsync',
    UpdateStationAsync = '/api/Station/UpdateStationAsync',
    DeleteStationAsync = '/api/Station/DeleteStationAsync',
    GetStationListAsync = '/api/Station/GetStationListAsync',

    CreateTruckAsync = '/api/Truck/CreateTruckAsync',
    UpdateTruckAsync = '/api/Truck/UpdateTruckAsync',
    DeleteTruckAsync = '/api/Truck/DeleteTruckAsync',
    GetTruckListAsync = '/api/Truck/GetTruckListAsync',

    CreateRateAsync = '/api/Rate/CreateRateAsync',
    UpdateRateAsync = '/api/Rate/UpdateRateAsync',
    DeleteRateAsync = '/api/Rate/DeleteRateAsync',
    GetRateListAsync = '/api/Rate/GetRateListAsync',

    CreateGodownAsync = '/api/Godown/CreateGodownAsync',
    UpdateGodownAsync = '/api/Godown/UpdateGodownAsync',
    DeleteGodownAsync = '/api/Godown/DeleteGodownAsync',
    GetGodownListAsync = '/api/Godown/GetGodownListAsync',

    CreateCompanyAsync = '/api/Company/CreateCompanyAsync',
    UpdateCompanyAsync = '/api/Company/UpdateCompanyAsync',
    DeleteCompanyAsync = '/api/Company/DeleteCompanyAsync',
    GetCompanyListAsync = '/api/Company/GetCompanyListAsync',


    CreateLevyAsync = '/api/Levy/CreateLevyAsync',
    UpdateLevyAsync = '/api/Levy/UpdateLevyAsync',
    DeleteLevyAsync = '/api/Levy/DeleteLevyAsync',
    GetLevyListAsync = '/api/Levy/GetLevyListAsync',
    

    VerifyUser = '/api/User/VerifyUserAsync',
    GetCurrentTime = '/api/User/GetCurerntTime',
    GetUserTypeListAsync = '/api/User/GetUserTypeListAsync',
    CreateUserAsync = '/api/User/CreateUserAsync',
    UpdateUserAsync = '/api/User/UpdateUserAsync',
    DeleteUserAsync = '/api/User/DeleteUserAsync',
    GetUserListAsync = '/api/User/GetUserListAsync',

}

export default Api;