unit Algo;

interface

type MyArray = array of integer;
procedure Generate(var arr: MyArray; range_l, range_r, n: integer);
procedure BubbleSort(var arr: MyArray);

implementation

procedure Generate(var arr: MyArray; range_l, range_r, n: integer);
var i: integer;

begin

  if n <= 0 then
  begin
    SetLength(arr, 0);
    exit;
  end;

  if range_l > range_r then
  begin
    SetLength(arr, 0);
    exit;
  end;

  SetLength(arr, n);
  Randomize;
  for i := 0 to n - 1 do
    arr[i] := Random(range_r - range_l + 1) + range_l;
end;

procedure BubbleSort(var arr: MyArray);
var i, j, temp: integer;

begin
  for i := 0 to Length(arr) - 2 do
    for j := 0 to Length(arr) - i - 2 do
      if arr[j] > arr[j + 1] then
      begin
        temp := arr[j];
        arr[j] := arr[j + 1];
        arr[j + 1] := temp;
      end;
end;

end.