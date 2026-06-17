//invoke the bridge class method showData with interface object Android
var x = Android;
x =  {
    getData: function () {
      console.log("From JS " + 4262676);
      return 5;
    }
    };
x.getData();