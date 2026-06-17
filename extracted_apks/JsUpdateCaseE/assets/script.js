
var x =  {
    getData: function () {
      console.log("From JS " + 4262676);
      return 5;
    }
    };
//override interface object
Android = x;
Android.getData();