program Tests;

uses Algo;

type UnitTestFunction = function: boolean;

procedure UnitTest(testFunc: UnitTestFunction; name: string);
begin
  if testFunc() then
    writeln('OK    ', name)
  else
    writeln('ERROR ', name);
end;

function IsSorted(arr: MyArray): boolean;
var i: integer;

begin
  for i := 0 to Length(arr) - 2 do
    if arr[i] > arr[i + 1] then
      exit(false);
  exit(true);
end;


function TestArraySize: boolean;
var arr: MyArray;
begin
  Generate(arr, 0, 10, 20);
  exit(Length(arr) = 20);
end;


function TestNegativeArraySize: boolean;
var arr: MyArray;
begin
  Generate(arr, 0, 10, -5);
  exit(Length(arr) = 0);
end;


function TestSortingCorrectness: boolean;
var arr: MyArray;
begin
  Generate(arr, 0, 100, 50);
  BubbleSort(arr);

  exit(IsSorted(arr));
end;

function TestWrongRange: boolean;
var arr: MyArray;
begin
  Generate(arr, 10, 5, 10);

  { empty array expected }
  exit(Length(arr) = 0);
end;

function TestNegativeNumbers: boolean;
var
  arr: MyArray;
begin
  Generate(arr, -50, -1, 20);
  BubbleSort(arr);

  exit(IsSorted(arr));
end;

begin
  UnitTest(@TestArraySize,          'TestArraySize');
  UnitTest(@TestNegativeArraySize,  'TestNegativeArraySize [expected empty array]');
  UnitTest(@TestSortingCorrectness, 'TestSortingCorrectness');
  UnitTest(@TestWrongRange,         'TestWrongRange [expected empty array]');
  UnitTest(@TestNegativeNumbers,    'TestNegativeNumbers');
end.