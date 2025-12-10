export default {
	abap: `* Comments
* Line Comments
" End of line comment used as line comment.
value = 1. " End of line comment

DATA:
	"! ABAPDoc comment
	value TYPE i.

* Strings
my_string = 'Simple string'.
my_string = 'String with an escaped '' inside'.
my_string = |A string template: { nvalue } times|.
my_string = |A string template: { nvalue } times|.
my_string = |Characters \\|, \\{, and \\} have to be escaped by \\\\ in literal text.|.

* Numbers and Operators
value = 001 + 2 - 3 * 4 / 5 ** 6.

IF value < 1 OR
	value = 2 OR
	value > 3 OR
	value <> 4 OR
	value <= 5 OR
	value >= 6.
ENDIF.

" Dynamic object assignment (with type cast check)
lo_interface ?= lo_class.

* Structures and Classes
DATA:
	BEGIN OF my_structure,
		scomponent TYPE i,
	END OF my_structure.

CLASS lcl_my_class DEFINITION.
	PUBLIC SECTION.
		METHODS my_method
			RETURNING
				VALUE(ret_value) TYPE i.
ENDCLASS.

CLASS lcl_my_class IMPLEMENTATION.
	METHOD my_method.
		ret_value = 1.
	ENDMETHOD
ENDCLASS.

DATA lo_instace TYPE REF TO lcl_my_class.

CREATE OBJECT lo_instace.

my_structure-component = lo_instace->my_method( ).
`,
	actionscript: `// Comments
// Single line comment
/* Multi-line
comment */

// Literal values
17
"hello"
-3
9.4
null
true
false

// Classes
class A {}
class B extends A {}

// Inline XML
var employees:XML =
	<employees>
		<employee ssn="123-123-1234">
			<name first="John" last="Doe"/>
			<address>
				<city>San Francisco</city>
				<state>CA</state>
				<zip>98765</zip>
			</address>
		</employee>
		<employee ssn="789-789-7890">
			<name first="Mary" last="Roe"/>
			<address>
				<city>Newton</city>
				<state>MA</state>
				<zip>01234</zip>
			</address>
		</employee>
	</employees>;

// Full example
package {
	import flash.display.*;
	import flash.events.*;
	import flash.filters.BlurFilter;
	import flash.geom.*;
	import flash.ui.*;
	public class ch23ex2 extends Sprite {
		protected const BMP_SCALE:Number = 1/2;
		protected const D:Number = 1.015;
		protected const DIM_EFFECT:ColorTransform = new ColorTransform(D, D, D);
		protected const B:int = 16;
		protected const BLUR_EFFECT:BlurFilter = new BlurFilter(B, B, 1);
		protected var RLUT:Array, GLUT:Array, BLUT:Array;
		protected var sourceBmp:BitmapData;
		protected var colorBmp:BitmapData;
		protected var touches:Array = new Array();
		protected var fingerShape:Shape = new Shape();
		public function ch23ex2() {
			try {
				var test:Class = Multitouch;
				if (Multitouch.supportsTouchEvents) {
					Multitouch.inputMode = MultitouchInputMode.TOUCH_POINT;
					init();
				} else {
					trace("Sorry, this example requires multitouch.");
				}
			} catch (error:ReferenceError) {
				trace("Sorry, but multitouch is not supported in this runtime.");
			}
		}
		protected function init():void {
			//create a black-and-white bitmap and a color bitmap, only show the color
			sourceBmp = new BitmapData(
				stage.stageWidth*BMP_SCALE, stage.stageHeight*BMP_SCALE, false, 0);
			colorBmp = sourceBmp.clone();
			var bitmap:Bitmap = new Bitmap(colorBmp, PixelSnapping.ALWAYS, true);
			bitmap.width = stage.stageWidth; bitmap.height = stage.stageHeight;
			addChild(bitmap);

			//create finger shape to paste onto the bitmap under your touches
			fingerShape.graphics.beginFill(0xffffff, 0.1);
			fingerShape.graphics.drawEllipse(-15, -20, 30, 40);
			fingerShape.graphics.endFill();

			//create the palette map from a gradient
			var gradient:Shape = new Shape();
			var m:Matrix = new Matrix();
			m.createGradientBox(256, 10);
			gradient.graphics.beginGradientFill(GradientType.LINEAR,
				[0x313ad8, 0x2dce4a, 0xdae234, 0x7a1c1c, 0x0f0303],
				[1, 1, 1, 1, 1], [0, 0.4*256, 0.75*256, 0.9*256, 255], m);
			gradient.graphics.drawRect(0, 0, 256, 10);
			var gradientBmp:BitmapData = new BitmapData(256, 10, false, 0);
			gradientBmp.draw(gradient);
			RLUT = new Array(); GLUT = new Array(); BLUT = new Array();
			for (var i:int = 0; i < 256; i++) {
				var pixelColor:uint = gradientBmp.getPixel(i, 0);
				//I drew the gradient backwards, so sue me
				RLUT[256-i] = pixelColor & 0xff0000;
				GLUT[256-i] = pixelColor & 0x00ff00;
				BLUT[256-i] = pixelColor & 0x0000ff;
			}

			stage.addEventListener(TouchEvent.TOUCH_BEGIN, assignTouch);
			stage.addEventListener(TouchEvent.TOUCH_MOVE, assignTouch);
			stage.addEventListener(TouchEvent.TOUCH_END, removeTouch);
			stage.addEventListener(Event.ENTER_FRAME, onEnterFrame);
		}
		protected function assignTouch(event:TouchEvent):void {
			touches[event.touchPointID] = event;
		}
		protected function removeTouch(event:TouchEvent):void {
			delete touches[event.touchPointID];
		}
		protected function onEnterFrame(event:Event):void {
			for (var key:String in touches) {
				var touch:TouchEvent = touches[key] as TouchEvent;
				if (touch) {
					//plaster the finger image under your finger
					var m:Matrix = new Matrix();
					m.translate(touch.stageX*BMP_SCALE, touch.stageY*BMP_SCALE);
					sourceBmp.draw(fingerShape, m, null, BlendMode.ADD);
				}
			}
			var O:Point = new Point(0, 0);
			//blur and ever-so-slightly brighten the image to make the color last
			sourceBmp.applyFilter(sourceBmp, sourceBmp.rect, O, BLUR_EFFECT);
			sourceBmp.colorTransform(sourceBmp.rect, DIM_EFFECT);
			//we've calculated the image in grayscale brightnesses, now make it color
			colorBmp.paletteMap(sourceBmp, sourceBmp.rect, O, RLUT, GLUT, BLUT, null);
		}
	}
}
`,
	abnf: `; Full example
rulelist      = 1*( rule / (*c-wsp c-nl) )

rule          = rulename defined-as elements c-nl
									; continues if next line starts
									;  with white space

rulename      = ALPHA *(ALPHA / DIGIT / "-")

defined-as    = *c-wsp ("=" / "=/") *c-wsp
									; basic rules definition and
									;  incremental alternatives

elements      = alternation *c-wsp

c-wsp         = WSP / (c-nl WSP)

c-nl          = comment / CRLF
									; comment or newline

comment       = ";" *(WSP / VCHAR) CRLF

alternation   = concatenation
									*(*c-wsp "/" *c-wsp concatenation)

concatenation = repetition *(1*c-wsp repetition)

repetition    = [repeat] element

repeat        = 1*DIGIT / (*DIGIT "*" *DIGIT)

element       = rulename / group / option /
									char-val / num-val / prose-val

group         = "(" *c-wsp alternation *c-wsp ")"

option        = "[" *c-wsp alternation *c-wsp "]"

char-val      = DQUOTE *(%x20-21 / %x23-7E) DQUOTE
									; quoted string of SP and VCHAR
									;  without DQUOTE

num-val       = "%" (bin-val / dec-val / hex-val)

bin-val       = "b" 1*BIT
									[ 1*("." 1*BIT) / ("-" 1*BIT) ]
									; series of concatenated bit values
									;  or single ONEOF range

dec-val       = "d" 1*DIGIT
									[ 1*("." 1*DIGIT) / ("-" 1*DIGIT) ]

hex-val       = "x" 1*HEXDIG
									[ 1*("." 1*HEXDIG) / ("-" 1*HEXDIG) ]

prose-val     = "<" *(%x20-3D / %x3F-7E) ">"
									; bracketed string of SP and VCHAR
									;  without angles
									; prose description, to be used as
									;  last resort
`,
	ada: `-- Strings
"foo ""bar"" baz"
"Multi-line strings are appended with a " &
"ampersand symbole."

-- Ada83 example
WITH ADA.TEXT_IO;

--  Comments look like this.

PROCEDURE TEST IS
BEGIN
	ADA.TEXT_IO.PUT_LINE ("Hello");   -- Comments look like this.
END TEST;

-- Ada 2012 full example
with Ada.Text_IO; Use Ada.Text_IO;

--  Comments look like this.
procedure Test is
	procedure Bah with
	Import        => True,   -- Shows the new aspect feature of the language.
	Convention    => C,
	External_Name => "bah";

	type Things is range 1 .. 10;
begin
	Put_Line ("Hello");   -- Comments look like this.

	Bah;  -- Call C function.

	for Index in Things'Range loop
		null;
	end loop;
end Test;
`,
	al: `// Full example
// Source: https://github.com/microsoft/AL/blob/master/samples/ControlAddIn/al/Page/CustomerCardAddIn.al

pageextension 50300 CustomerCardAddIn extends "Customer Card"
{
	layout
	{
		addafter(Blocked)
		{
			usercontrol(ControlName; TestAddIn)
			{
				ApplicationArea = All;

				trigger Callback(i : integer; s: text; d : decimal; c : char)
				begin
					Message('Got from js: %1, %2, %3, %4', i, s, d, c);
				end;
			}
		}
	}

	actions
	{
		addafter(Approve)
		{
			action(CallJavaScript)
			{
				ApplicationArea = All;

				trigger OnAction();
				begin
					CurrPage.ControlName.CallJavaScript(5, 'text', 6.3, 'c');
				end;
			}

			action(CallViaCodeunit)
			{
				ApplicationArea = All;

				trigger OnAction();
				var c : Codeunit AddInHelpers;
				begin
					c.CallJavaScript(CurrPage.ControlName);
				end;
			}

			action(CallStaleControlAddIn)
			{
				ApplicationArea = All;

				trigger OnAction();
				var c : Codeunit AddInHelpersSingleton;
				begin
					c.CallStaleAddInMethod();
					Message('Probably nothing should happen...');
				end;
			}
		}
	}
}
`,
	agda: `-- Agda Full Example
-- 1.1 Naturals

module plfa.part1.Naturals where

-- The standard way to enter Unicode math symbols in Agda
-- is to use the IME provided by agda-mode.
-- for example ℕ can be entered by typing \\bN.

-- The inductive definition of natural numbers.
-- In Agda, data declarations correspond to axioms.
-- Also types correspond to sets.
-- CHAR: \\bN → ℕ
data ℕ : Set where
	-- This corresponds to the \`zero\` rule in Dedekin-Peano's axioms.
	-- Note that the syntax resembles Haskell GADTs.
	-- Also note that the \`has-type\` operator is \`:\` (as in Idris), not \`::\` (as in Haskell).
	zero : ℕ
	-- This corresponds to the \`succesor\` rule in Dedekin-Peano's axioms.
	-- In such a constructive system in Agda, induction rules etc comes by nature.
	-- The function arrow can be either \`->\` or \`→\`.
	-- CHAR: \\to or \\-> or \\r- → →
	suc  : ℕ → ℕ

-- EXERCISE \`seven\`
seven : ℕ
seven = suc (suc (suc (suc (suc (suc (suc zero))))))

-- This line is a compiler pragma.
-- It makes \`ℕ\` correspond to Haskell's type \`Integer\`
-- and allows us to use number literals (0, 1, 2, ...) to express \`ℕ\`.
{-# BUILTIN NATURAL ℕ #-}

-- Agda has a module system corresponding to the project file structure.
-- e.g. \`My.Namespace\` is in
-- \`project path/My/Namespace.agda\`.

-- The \`import\` statement does NOT expose the names to the top namespace.
-- You'll have to use \`My.Namespace.thing\` instead of directly \`thing\`.
import Relation.Binary.PropositionalEquality as Eq
-- The \`open\` statement unpacks all the names in a imported namespace and exposes them to the top namespace.
-- Alternatively the \`open import\` statement imports a namespace and opens it at the same time.
-- The \`using (a; ..)\` clause can limit a range of names to expose, instead of all of them.
-- Alternatively, the \`hiding (a; ..)\` clause can limit a range of names NOT to expose.
-- Also the \`renaming (a to b; ..)\` clause can rename names.
-- CHAR: \\== → ≡
--       \\gt → ⟨
--       \\lt → ⟩
--       \\qed → ∎
open Eq using (_≡_; refl)
open Eq.≡-Reasoning using (begin_; _≡⟨⟩_; _∎)

-- Addition of \`ℕ\`.
-- Note that Agda functions are *like* Haskell functions.
-- In Agda, operators can be mixfix (incl. infix, prefix, suffix, self-bracketing and many others).
-- All the \`holes\` are represented by \`_\`s. Unlike Haskell, operator names don't need to be put in parentheses.
-- Operators can also be called in the manner of normal functions.
-- e.g. a + b = _+_ a b.
-- Sections are also available, though somehow weird.
-- e.g. a +_ = _+_ a.
_+_ : ℕ → ℕ → ℕ
-- Lhs can also be infix!
-- This is the standard definition in both Peano and Agda stdlib.
-- We do pattern match on the first parameter, it's both convention and for convenience.
-- Agda does a termination check on recursive function.
-- Here the first parameter decreases over evaluation thus it is *well-founded*.
zero    + n = n
(suc m) + n = suc (m + n)

-- Here we take a glance at the *dependent type*.
-- In dependent type, we can put values into type level, and vice versa.
-- This is especially useful when we're expecting to make the types more precise.
-- Here \`_≡_\` is a type that says that two values are *the same*, that is, samely constructed.
_ : 2 + 3 ≡ 5
-- We can do it by ≡-Reasoning, that is writing a (unreasonably long) chain of equations.
_ =
	begin
		2 + 3
	≡⟨⟩ -- This operator means the lhs and rhs can be reduced to the same form so that they are equal.
		suc (1 + 3)
	≡⟨⟩
		suc (suc (0 + 3)) -- Just simulating the function evaluation
	≡⟨⟩
		suc (suc 3)
	≡⟨⟩
		5
	∎ -- The *tombstone*, QED.

-- Well actually we can also get this done by simply writing \`refl\`.
-- \`refl\` is a proof that says "If two values evaluates to the same form, then they are equal".
-- Since Agda can automatically evaluate the terms for us, this makes sense.
_ : 2 + 3 ≡ 5
_ = refl

-- Multiplication of \`ℕ\`, defined with addition.
_*_ : ℕ → ℕ → ℕ
-- Here we can notice that in Agda we prefer to indent by *visual blocks* instead by a fixed number of spaces.
zero    * n = zero
-- Here the addition is at the front, to be consistent with addition.
(suc m) * n = n + (m * n)

-- EXERCISE \`_^_\`, Exponentation of \`ℕ\`.
_^_ : ℕ → ℕ → ℕ
-- We can only pattern match the 2nd argument.
m ^ zero    = suc zero
m ^ (suc n) = m * (m ^ n)

-- *Monus* (a wordplay on minus), the non-negative subtraction of \`ℕ\`.
-- if less than 0 then we get 0.
-- CHAR: \\.- → ∸
_∸_ : ℕ → ℕ → ℕ
m     ∸ zero  = m
zero  ∸ suc n = zero
suc m ∸ suc n = m ∸ n

-- Now we define the precedence of the operators, as in Haskell.
infixl 6 _+_ _∸_
infixl 7 _*_

-- These are some more pragmas. Should be self-explaining.
{-# BUILTIN NATPLUS _+_ #-}
{-# BUILTIN NATTIMES _*_ #-}
{-# BUILTIN NATMINUS _∸_ #-}

-- EXERCISE \`Bin\`. We define a binary representation of natural numbers.
-- Leading \`O\`s are acceptable.
data Bin : Set where
	⟨⟩ : Bin
	_O : Bin → Bin
	_I : Bin → Bin

-- Like \`suc\` for \`Bin\`.
inc : Bin → Bin
inc ⟨⟩ = ⟨⟩ I
inc (b O) = b I
inc (b I) = (inc b) O

-- \`ℕ\` to \`Bin\`. This is a Θ(n) solution and awaits a better Θ(log n) reimpelementation.
to : ℕ → Bin
to zero    = ⟨⟩ O
to (suc n) = inc (to n)

-- \`Bin\` to \`ℕ\`.
from : Bin → ℕ
from ⟨⟩    = 0
from (b O) = 2 * (from b)
from (b I) = 1 + 2 * (from b)

-- Simple tests from 0 to 4.
_ : from (to 0) ≡ 0
_ = refl

_ : from (to 1) ≡ 1
_ = refl

_ : from (to 2) ≡ 2
_ = refl

_ : from (to 3) ≡ 3
_ = refl

_ : from (to 4) ≡ 4
_ = refl

-- EXERCISE END \`Bin\`

-- STDLIB: import Data.Nat using (ℕ; zero; suc; _+_; _*_; _^_; _∸_)
`,
	antlr4: `// Full example
// Source: https://github.com/antlr/grammars-v4/blob/master/json/JSON.g4

/** Taken from "The Definitive ANTLR 4 Reference" by Terence Parr */

// Derived from http://json.org
grammar JSON;

json
	: value
	;

obj
	: '{' pair (',' pair)* '}'
	| '{' '}'
	;

pair
	: STRING ':' value
	;

array
	: '[' value (',' value)* ']'
	| '[' ']'
	;

value
	: STRING
	| NUMBER
	| obj
	| array
	| 'true'
	| 'false'
	| 'null'
	;


STRING
	: '"' (ESC | SAFECODEPOINT)* '"'
	;


fragment ESC
	: '\\\\' (["\\\\/bfnrt] | UNICODE)
	;
fragment UNICODE
	: 'u' HEX HEX HEX HEX
	;
fragment HEX
	: [0-9a-fA-F]
	;
fragment SAFECODEPOINT
	: ~ ["\\\\\\u0000-\\u001F]
	;


NUMBER
	: '-'? INT ('.' [0-9] +)? EXP?
	;

fragment INT
	: '0' | [1-9] [0-9]*
	;

// no leading zeros

fragment EXP
	: [Ee] [+\\-]? INT
	;

// \\- since - means "range" inside [...]

WS
	: [ \\t\\n\\r] + -> skip
	;
`,
	apacheconf: `# Comments
# This is a comment
# <VirtualHost *:80>

# Directives
<Files .htaccess>
	Order allow,deny
	Deny from all
</Files>

# Variables
RewriteCond %{REQUEST_FILENAME}.php -f

# Regex
^(.*)$
!^www\\.

# Directive flags
[NC]
[RC=301,L]

# Strings
AuthName "Fichiers réservés"

# Full example
## BASIC PASSWORD PROTECTION
AuthType basic
AuthName "prompt"
AuthUserFile /.htpasswd
AuthGroupFile /dev/null
Require valid-user

## ALLOW FROM IP OR VALID PASSWORD
Require valid-user
Allow from 192.168.1.23
Satisfy Any

## PROTECT FILES
Order Allow,Deny
Deny from all

## REQUIRE SUBDOMAIN
RewriteCond %{HTTP_HOST} !^$
RewriteCond %{HTTP_HOST} !^subdomain\\.domain\\.tld$ [NC]
RewriteRule ^/(.*)$ http://subdomain.domain.tld/$1 [L,R=301]

ErrorDocument 403 http://www.example.com/logo.gif
ErrorDocument 403 /images/you_bad_hotlinker.gif

## REDIRECT UPLOADS
RewriteCond %{REQUEST_METHOD} ^(PUT|POST)$ [NC]
RewriteRule ^(.*)$ /cgi-bin/form-upload-processor.cgi?p=$1 [L,QSA]
`,
	apex: `// Full example
// source: https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_shopping_cart_example_code.htm

trigger calculate on Item__c (after insert, after update, after delete) {

// Use a map because it doesn't allow duplicate values

Map<ID, Shipping_Invoice__C> updateMap = new Map<ID, Shipping_Invoice__C>();

// Set this integer to -1 if we are deleting
Integer subtract ;

// Populate the list of items based on trigger type
List<Item__c> itemList;
	if(trigger.isInsert || trigger.isUpdate){
		itemList = Trigger.new;
		subtract = 1;
	}
	else if(trigger.isDelete)
	{
		// Note -- there is no trigger.new in delete
		itemList = trigger.old;
		subtract = -1;
	}

// Access all the information we need in a single query
// rather than querying when we need it.
// This is a best practice for bulkifying requests

set<Id> AllItems = new set<id>();

for(item__c i :itemList){
// Assert numbers are not negative.
// None of the fields would make sense with a negative value

System.assert(i.quantity__c > 0, 'Quantity must be positive');
System.assert(i.weight__c >= 0, 'Weight must be non-negative');
System.assert(i.price__c >= 0, 'Price must be non-negative');

// If there is a duplicate Id, it won't get added to a set
AllItems.add(i.Shipping_Invoice__C);
}

// Accessing all shipping invoices associated with the items in the trigger
List<Shipping_Invoice__C> AllShippingInvoices = [SELECT Id, ShippingDiscount__c,
                   SubTotal__c, TotalWeight__c, Tax__c, GrandTotal__c
                   FROM Shipping_Invoice__C WHERE Id IN :AllItems];

// Take the list we just populated and put it into a Map.
// This will make it easier to look up a shipping invoice
// because you must iterate a list, but you can use lookup for a map,
Map<ID, Shipping_Invoice__C> SIMap = new Map<ID, Shipping_Invoice__C>();

for(Shipping_Invoice__C sc : AllShippingInvoices)
{
	SIMap.put(sc.id, sc);
}

// Process the list of items
	if(Trigger.isUpdate)
	{
		// Treat updates like a removal of the old item and addition of the
		// revised item rather than figuring out the differences of each field
		// and acting accordingly.
		// Note updates have both trigger.new and trigger.old
		for(Integer x = 0; x < Trigger.old.size(); x++)
		{
			Shipping_Invoice__C myOrder;
			myOrder = SIMap.get(trigger.old[x].Shipping_Invoice__C);

			// Decrement the previous value from the subtotal and weight.
			myOrder.SubTotal__c -= (trigger.old[x].price__c *
			                        trigger.old[x].quantity__c);
			myOrder.TotalWeight__c -= (trigger.old[x].weight__c *
			                           trigger.old[x].quantity__c);

			// Increment the new subtotal and weight.
			myOrder.SubTotal__c += (trigger.new[x].price__c *
			                        trigger.new[x].quantity__c);
			myOrder.TotalWeight__c += (trigger.new[x].weight__c *
			                           trigger.new[x].quantity__c);
		}

		for(Shipping_Invoice__C myOrder : AllShippingInvoices)
		{

			// Set tax rate to 9.25%  Please note, this is a simple example.
			// Generally, you would never hard code values.
			// Leveraging Custom Settings for tax rates is a best practice.
			// See Custom Settings in the Apex Developer Guide
			// for more information.
			myOrder.Tax__c = myOrder.Subtotal__c * .0925;

			// Reset the shipping discount
			myOrder.ShippingDiscount__c = 0;

			// Set shipping rate to 75 cents per pound.
			// Generally, you would never hard code values.
			// Leveraging Custom Settings for the shipping rate is a best practice.
			// See Custom Settings in the Apex Developer Guide
			// for more information.
			myOrder.Shipping__c = (myOrder.totalWeight__c * .75);
			myOrder.GrandTotal__c = myOrder.SubTotal__c + myOrder.tax__c +
			                        myOrder.Shipping__c;
			updateMap.put(myOrder.id, myOrder);
		}
	}
	else
	{
		for(Item__c itemToProcess : itemList)
		{
			Shipping_Invoice__C myOrder;

			// Look up the correct shipping invoice from the ones we got earlier
			myOrder = SIMap.get(itemToProcess.Shipping_Invoice__C);
			myOrder.SubTotal__c += (itemToProcess.price__c *
			                        itemToProcess.quantity__c * subtract);
			myOrder.TotalWeight__c += (itemToProcess.weight__c *
			                           itemToProcess.quantity__c * subtract);
		}

		for(Shipping_Invoice__C myOrder : AllShippingInvoices)
		{

			// Set tax rate to 9.25%  Please note, this is a simple example.
			// Generally, you would never hard code values.
			// Leveraging Custom Settings for tax rates is a best practice.
			// See Custom Settings in the Apex Developer Guide
			// for more information.
			myOrder.Tax__c = myOrder.Subtotal__c * .0925;

			// Reset shipping discount
			myOrder.ShippingDiscount__c = 0;

			// Set shipping rate to 75 cents per pound.
			// Generally, you would never hard code values.
			// Leveraging Custom Settings for the shipping rate is a best practice.
			// See Custom Settings in the Apex Developer Guide
			// for more information.
			myOrder.Shipping__c = (myOrder.totalWeight__c * .75);
			myOrder.GrandTotal__c = myOrder.SubTotal__c + myOrder.tax__c +
			                        myOrder.Shipping__c;

			updateMap.put(myOrder.id, myOrder);

		}
	}

	// Only use one DML update at the end.
	// This minimizes the number of DML requests generated from this trigger.
	update updateMap.values();
}
`,
	apl: `⍝ Comments
#!/usr/bin/env runapl
a←1 2 3 ⍝ this is a comment

⍝ Strings
''
'foobar'
'foo''bar''baz'

⍝ Numbers
42
3.14159
¯2
∞
2.8e¯4
2j3
¯4.3e2J1.9e¯4

⍝ Primitive functions
a+b×c⍴⍳10

⍝ Operators
+/ f⍣2

⍝ Dfns
{0=⍴⍴⍺:'hello' ⋄ ∇¨⍵}
`,
	applescript: `-- Comments
-- Single line comment
#!/usr/bin/osascript
(* Here is
a block
comment *)

-- Strings
"foo \\"bar\\" baz"

-- Operators
a ≠ b
12 + 2 * 5
"DUMPtruck" is equal to "dumptruck"
"zebra" comes after "aardvark"
{ "this", "is", 2, "cool" } starts with "this"
{ "is", 2} is contained by { "this", "is", 2, "cool" }
set docRef to a reference to the first document

-- Classes and units
tell application "Finder"
text 1 thru 5 of "Bring me the mouse."
set averageTemp to 63 as degrees Fahrenheit
set circleArea to (pi * 7 * 7) as square yards
`,
	aql: `// Full example
FOR u IN users
	FOR f IN friends
		FILTER u.active == @active && f.active == true && u.id == f.userId
		RETURN { "name" : u.name, "friends" : friends }

LET name = "Peter"
LET age = 42
RETURN { name, age }

FOR u IN users
	FILTER u.status == "not active"
	UPDATE u WITH { status: "inactive" } IN users

FOR i IN 1..100
	INSERT { value: i } IN test
	RETURN NEW
`,
	arduino: `// Strings
"foo \\"bar\\" baz"
'foo \\'bar\\' baz'
"Multi-line strings ending with a \\
are supported too."

// Macro statements
#include <Bridge.h>
#define SOME_PIN 11

// Booleans
true;
false;

// Operators
a < b;
c && d;

// Full example
#include <Bridge.h>

// pin of the piezo speaker
int piezo = 8;

/**
 * setups
 * runs once before everyhing else
 */
void setup() {
	pinMode(piezo, OUTPUT);
}

/**
 * loop
 * this will run forever and do what we want
 */
void loop() {
	playMelody(1);
	delay(1000);
}

/**
 * playMelody
 * will play a simple melody on piezo speaker
 */
void playMelody(int times) {
	int melody[] = { 4699, 4699, 3520, 4699 };
	int duration = 6;

	for (int t = 0; t < times; t++ ) {
		for( int i = 0; i < 4; i++ ) {
			// pass tone to selected pin
			tone(piezoPin, melody[i], 1000/duration);

			// get a bit of time between the tones
			delay(1000 / duration * 1.30 + 80);

			// and don't forget to switch of the tone afterwards
			noTone(piezoPin);
		}
	}
}
`,
	arff: `% Comments
%
% Some comments
%
%

% Keywords
@attribute
@data
@relation

% Numbers
42
0.14

% Strings
'Single \\'quoted\\' string'
"Double \\"quoted\\" string"

% Full example
% 1. Title: Iris Plants Database
%
% 2. Sources:
%      (a) Creator: R.A. Fisher
%      (b) Donor: Michael Marshall (MARSHALL%PLU@io.arc.nasa.gov)
%      (c) Date: July, 1988
%
@RELATION iris

@ATTRIBUTE sepallength  NUMERIC
@ATTRIBUTE sepalwidth   NUMERIC
@ATTRIBUTE petallength  NUMERIC
@ATTRIBUTE petalwidth   NUMERIC
@ATTRIBUTE class        {Iris-setosa,Iris-versicolor,Iris-virginica}

@DATA
5.1,3.5,1.4,0.2,Iris-setosa
4.9,3.0,1.4,0.2,Iris-setosa
4.7,3.2,1.3,0.2,Iris-setosa
4.6,3.1,1.5,0.2,Iris-setosa
5.0,3.6,1.4,0.2,Iris-setosa
5.4,3.9,1.7,0.4,Iris-setosa
4.6,3.4,1.4,0.3,Iris-setosa
5.0,3.4,1.5,0.2,Iris-setosa
4.4,2.9,1.4,0.2,Iris-setosa
4.9,3.1,1.5,0.1,Iris-setosa
`,
	armasm: `; Full example
; Source: https://developer.arm.com/documentation/dui0473/c/writing-arm-assembly-language/subroutines-calls
				AREA    subrout, CODE, READONLY     ; Name this block of code
				ENTRY                     ; Mark first instruction to execute
start   MOV     r0, #10           ; Set up parameters
				MOV     r1, #3
				BL      doadd             ; Call subroutine
stop    MOV     r0, #0x18         ; angel_SWIreason_ReportException
				LDR     r1, =0x20026      ; ADP_Stopped_ApplicationExit
				SVC     #0x123456         ; ARM semihosting (formerly SWI)
doadd   ADD     r0, r0, r1        ; Subroutine code
				BX      lr                ; Return from subroutine
				END                       ; Mark end of file
`,
	arturo: `; Full example
; this is a comment
; this is another comment

;---------------------------------
; VARIABLES & VALUES
;---------------------------------

; numbers
a1: 2
a2: 3.14
a3: to :complex [1 2.0]     ; 1.0+2.0i

; strings
c1: "this is a string"
c2: {
	this is a multiline string
	that is indentation-agnostic
}
c3: {:
	this is 
		a verbatim
			multiline string
				which will remain exactly
					as the original
:}

; characters
ch: \`c\`

; blocks/arrays
d: [1 2 3]

; dictionaries
e: #[
	name: "John"
	surname: "Doe"
	age: 34
	likes: [pizza spaghetti]
]

; yes, functions are values too
f: function [x][
	2 * x
]

; colors - right, you can directly define them as well!
g1: #red
g2: #0077BF

; dates
h: now              ; 2021-05-03T17:10:48+02:00

; logical values
i1: true
i2: false
i3: maybe

;---------------------------------
; BASIC OPERATORS
;---------------------------------

; simple arithmetic
1 + 1       ; => 2
8 - 1       ; => 7
4.2 - 1.1   ; => 3.1
10 * 2      ; => 20
35 / 4      ; => 8
35 // 4     ; => 8.75
2 ^ 5       ; => 32
5 % 3       ; => 2

; bitwise operators
and 3 5     ; => 1
or 3 5      ; => 7
xor 3 5     ; => 6

; pre-defined constants
pi          ; => 3.141592653589793
epsilon     ; => 2.718281828459045
null        ; => null
true        ; => true
false       ; => false

;---------------------------------
; COMPARISON OPERATORS
;---------------------------------

; equality
1 = 1       ; => true
2 = 1       ; => false

; inequality
1 <> 1      ; => false
2 <> 1      ; => true

; more comparisons
1 < 10      ; => true
1 =< 10     ; => true
10 =< 10    ; => true
1 > 10      ; => false
1 >= 10     ; => false
11 >= 10    ; => true

;---------------------------------
; CONDITIONALS
;---------------------------------

; logical operators
and? true true      ; => true
and? true false     ; => false
or? true false      ; => true
or? false false     ; => false

and? [1=2][2<3]     ; => false 
										; (the second block will not be evaluated)

; simple if statements
if 2 > 1 [ print "yes!"]    ; yes!
if 3 <> 2 -> print "true!"  ; true!

; if/else statements
if? 2 > 3 -> print "2 is greater than 3"
else -> print "2 is not greater than 3"         ; 2 is not greater than 3

; switch statements
switch 2 > 3 -> print "2 is greater than 3"
									 -> print "2 is not greater than 3" ; 2 is not greater than 3

a: (2 > 3)["yes"]["no"]         ; a: "no"
a: (2 > 3)? -> "yes" -> "no"    ; a: "no" (exactly the same as above)

; case/when statements
case [1]
	when? [>2] -> print "1 is greater than 2. what?!"
	when? [<0] -> print "1 is less than 0. nope..."
	else -> print "here we are!"                ; here we are!

;---------------------------------
; LOOPS
;---------------------------------

; with \`loop\`
arr: [1 4 5 3]
loop arr 'x [
	print ["x =" x]
]
; x = 1
; x = 4
; x = 5
; x = 3

; with loop and custom index
loop.with:'i arr 'x [
	print ["item at position" i "=>" x]
]
; item at position 0 => 1
; item at position 1 => 4
; item at position 2 => 5
; item at position 3 => 3

; using ranges
loop 1..3 'x ->       ; since it's a single statement
	print x             ; there's no need for [block] notation
											; we can wrap it up using the \`->\` syntactic sugar

loop \`a\`..\`c\` 'ch ->
	print ch
; a
; b
; c

; picking multiple items
loop 1..10 [x y] ->
	print ["x =" x ", y =" y]
; x = 1 , y = 2 
; x = 3 , y = 4 
; x = 5 , y = 6 
; x = 7 , y = 8 
; x = 9 , y = 10 

; looping through a dictionary
dict: #[name: "John", surname: "Doe", age: 34]
loop dict [key value][
	print [key "->" value]
]
; name -> John 
; surname -> Doe 
; age -> 34 
					
; while loops
i: new 0
while [i<3][
	print ["i =" i]
	inc 'i
]
; i = 0
; i = 1
; i = 2
	
;---------------------------------
; STRINGS
;---------------------------------

; case
a: "tHis Is a stRinG"
print upper a               ; THIS IS A STRING
print lower a               ; this is a string
print capitalize a          ; THis Is a stRinG

; concatenation
a: "Hello " ++ "World!"     ; a: "Hello World!"

; strings as an array
split "hello"               ; => [h e l l o]
split.words "hello world"   ; => [hello world]

print first "hello"         ; h
print last "hello"          ; o

; conversion
to :string 123              ; => "123"
to :integer "123"           ; => 123

; joining strings together
join ["hello" "world"]              ; => "helloworld"
join.with:"-" ["hello" "world"]     ; => "hello-world"

; string interpolation
x: 2
print ~"x = |x|"            ; x = 2

; interpolation with \`print\`
print ["x =" x]             ; x = 2
														; (\`print\` works by calculating the given block
														;  and joining the different values as strings
														;  with a single space between them)

; templates
print render.template {
	<||= switch x=2 [ ||>
		Yes, x = 2
	<||][||>
		No, x is not 2
	<||]||> 
} ; Yes, x = 2

; matching
prefix? "hello" "he"        ; => true
suffix? "hello" "he"        ; => false

contains? "hello" "ll"      ; => true
contains? "hello" "he"      ; => true
contains? "hello" "x"       ; => false

in? "ll" "hello"            ; => true 
in? "x" "hello"             ; => false

;---------------------------------
; BLOCKS
;---------------------------------

; calculate a block
arr: [1 1+1 1+1+1]
@arr                        ; => [1 2 3]

; execute a block
sth: [print "Hello world"]  ; this is perfectly valid,
														; could contain *anything*
														; and will not be executed...

do sth                      ; Hello world
														; (...until we tell it to)

; array indexing
arr: ["zero" "one" "two" "three"]
print first arr             ; zero
print arr\\0                 ; zero
print last arr              ; three
print arr\\3                 ; three

x: 2
print get arr x             ; two
print arr\\[x]               ; two

; setting an array element
arr\\0: "nada"
set arr 2 "dos"
print arr                   ; nada one dos three

; adding elements to an array
arr: new []
'arr ++ "one"
'arr ++ "two"
print arr                   ; one two

; remove elements from an array
arr: new ["one" "two" "three" "four"]
'arr -- "two"               ; arr: ["one" "three" "four"]
remove 'arr .index 0        ; arr: ["three" "four"]

; getting the size of an array
arr: ["one" 2 "three" 4]
print size arr              ; 4

; getting a slice of an array
print slice ["one" "two" "three" "four"] 0 1        ; one two

; check if array contains a specific element
print contains? arr "one"   ; true
print contains? arr "five"  ; false

; sorting array
arr: [1 5 3 2 4]
sort arr                    ; => [1 2 3 4 5]
sort.descending arr         ; => [5 4 3 2 1]

; mapping values
map 1..10 [x][2*x]          ; => [2 4 6 8 10 12 14 16 18 20]
map 1..10 'x -> 2*x         ; same as above
map 1..10 => [2*&]          ; same as above
map 1..10 => [2*]           ; same as above

; selecting/filtering array values
select 1..10 [x][odd? x]    ; => [1 3 5 7 9]
select 1..10 => odd?        ; same as above

filter 1..10 => odd?        ; => [2 4 6 8 10]
														; (now, we leave out all odd numbers - 
														;  while select keeps them)

; misc operations
arr: ["one" 2 "three" 4]
reverse arr                 ; => [4 "three" 2 "one"]
shuffle arr                 ; => [2 4 "three" "one"]
unique [1 2 3 2 3 1]        ; => [1 2 3]
permutate [1 2 3]           ; => [[1 2 3] [1 3 2] [3 1 2] [2 1 3] [2 3 1] [3 2 1]]
take 1..10 3                ; => [1 2 3]
repeat [1 2] 3              ; => [1 2 1 2 1 2]

;---------------------------------
; FUNCTIONS
;---------------------------------

; declaring a function
f: function [x][ 2*x ]
f: function [x]-> 2*x       ; same as above
f: $[x]->2*x                ; same as above (only using the \`$\` alias 
														;  for the \`function\`... function)

; calling a function
f 10                        ; => 20

; returning a value
g: function [x][
	if x < 2 -> return 0

	res: 0
	loop 0..x 'z [
		res: res + z
	]
	return res
]

;---------------------------------
; CUSTOM TYPES
;---------------------------------

; defining a custom type
define :person [            ; define a new custom type "Person"
	name                      ; with fields: name, surname, age
	surname
	age 
][ 
	; with custom post-construction initializer
	init: [
		this\\name: capitalize this\\name
	]

	; custom print function
	print: [
		render "NAME: |this\\name|, SURNAME: |this\\surname|, AGE: |this\\age|"
	]

	; custom comparison operator
	compare: 'age
]

; create a method for our custom type
sayHello: function [this][
	ensure -> is? :person this

	print ["Hello" this\\name]
]

; create new objects of our custom type
a: to :person ["John" "Doe" 34]                 ; let's create 2 "Person"s
b: to :person ["jane" "Doe" 33]                 ; and another one

; call pseudo-inner method
sayHello a                                      ; Hello John                       
sayHello b                                      ; Hello Jane

; access object fields
print ["The first person's name is:" a\\name]    ; The first person's name is: John
print ["The second person's name is:" b\\name]   ; The second person's name is: Jane

; changing object fields
a\\name: "Bob"                                   
sayHello a                                      ; Hello Bob

; verifying object type
print type a                                    ; :person
print is? :person a                             ; true

; printing objects
print a                                         ; NAME: John, SURNAME: Doe, AGE: 34

; sorting user objects (using custom comparator)
sort @[a b]                                     ; Jane..., John...
sort.descending @[a b]                          ; John..., Jane...
`,
	asm6502: `; Comments
; This is a comment

; Labels
label1:   ; a label

; Opcodes
SEI
CLC

; lowercase
inx
bne label1

; Assembler directives
.segment CODE
.word $07d3

; Registers
ASL A  ; "A"
LDA label1,x  ; "x"

; Strings
.include "header.asm"

; Numbers
LDA #127
STA $80f0
LDY #%01011000
`,
	asciidoc: `// Comments
/////
Comment block
/////

// Comment line

// Titles
Level 0
========
Level 1
--------
Level 2
~~~~~~~~
Level 3
^^^^^^^^
Level 4
++++++++

= Document Title (level 0) =
== Section title (level 1) ==
=== Section title (level 2) ===
==== Section title (level 3) ====
===== Section title (level 4) =====

.Notes

// Blocks
++++++++++++++++++++++++++
Passthrough block
++++++++++++++++++++++++++

--------------------------
Listing block
--------------------------

..........................
Literal block
No *highlighting* _here_
..........................

**************************
Sidebar block
**************************

[quote,'http://en.wikipedia.org/wiki/Samuel_Johnson[Samuel Johnson]']
_____________________________________________________________________
Sir, a woman's preaching is like a dog's walking on his hind legs. It
is not done well; but you are surprised to find it done at all.
_____________________________________________________________________

==========================
Example block
==========================

// Lists
- List item.
* List item.
** List item.
*** List item.
**** List item.
***** List item.

1.   Arabic (decimal) numbered list item.
a.   Lower case alpha (letter) numbered list item.
F.   Upper case alpha (letter) numbered list item.
iii) Lower case roman numbered list item.
IX)  Upper case roman numbered list item.

. Arabic (decimal) numbered list item.
.. Lower case alpha (letter) numbered list item.
... Lower case roman numbered list item.
.... Upper case alpha (letter) numbered list item.
..... Upper case roman numbered list item.

Dolor::
	Donec eget arcu bibendum nunc consequat lobortis.
	Suspendisse;;
		A massa id sem aliquam auctor.
	Morbi;;
		Pretium nulla vel lorem.
	In;;
		Dictum mauris in urna.
		Vivamus::: Fringilla mi eu lacus.
		Donec:::   Eget arcu bibendum nunc consequat lobortis.

// Tables
[cols="e,m,^,>s",width="25%"]
|============================
|1 >s|2 |3 |4
^|5 2.2+^.^|6 .3+<.>m|7
^|8
|9 2+>|10
|============================

// Inline styles
*Some bold text*
This is an _emphasis_
[[[walsh-muellner]]]

// Attribute entries
:Author Initials: JB
{authorinitials}
:Author Initials!:
`,
	astro: `---
// Component script
import MyComponent from "./MyComponent.astro"
type Props = {
	type?: string
	foo?: any
}

const items = ["1", "2", "3"]
---

<!-- Template -->
<MyComponent someProperty={false} />
<button type={Astro.props.type} {...foo}>
	Click me
</button>

<!-- Note that expressions use TSX -->
<!-- So you'll get autocompletion for React TSX there -->
<ul>
	{items.map((item: string) => <li>{item}</li>)}
</ul>

<!-- Inline script with JavaScript -->
<script is:inline>
	let string = "This is not TypeScript!"
</script>

<!-- Script with TypeScript -->
<script>
	let s: string = "This is TypeScript!"
</script>

<!-- Normal style element -->
<style>
	div {
		color: red;
	}
</style>

<!-- Style element with SCSS -->
<style lang="scss">
	$primary-color: #333;
	body {
		color: $primary-color;
	}
</style>
`,
	aspnet: `<%-- Comments --%>
<%-- This is a comment --%>
<%-- This is a
multi-line comment --%>

<%-- Page directives --%>
<%@ Page Title="Products" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true"  CodeBehind="ProductList.aspx.cs" Inherits="WingtipToys.ProductList" %>

<%-- Directive tag --%>
<%: Page.Title %>
<a href="ProductDetails.aspx?productID=<%#:Item.ProductID%>">
<span>
	<%#:Item.ProductName%>
</span>

<%-- Highlighted C# inside scripts --%>
<script runat="server">
	// The following variables are visible to all procedures
	// within the script block.
	String str;
	int i;
	int i2;

	int DoubleIt(int inpt)
	{
		// The following variable is visible only within
		// the DoubleIt procedure.
		int factor = 2;

		return inpt * factor;
	}
</script>
`,
	autohotkey: `; Comments
; This is a comment

; Strings
"foo ""bar"" baz"

; Numbers
123
123.456
123.456e789
0xAF

; Full example
;----Open the selected favorite
f_OpenFavorite:
; Fetch the array element that corresponds to the selected menu item:
StringTrimLeft, f_path, f_path%A_ThisMenuItemPos%, 0
if f_path =
	return
if f_class = #32770    ; It's a dialog.
{
	if f_Edit1Pos <>   ; And it has an Edit1 control.
	{
		; Activate the window so that if the user is middle-clicking
		; outside the dialog, subsequent clicks will also work:
		WinActivate ahk_id %f_window_id%
		; Retrieve any filename that might already be in the field so
		; that it can be restored after the switch to the new folder:
		ControlGetText, f_text, Edit1, ahk_id %f_window_id%
		ControlSetText, Edit1, %f_path%, ahk_id %f_window_id%
		ControlSend, Edit1, {Enter}, ahk_id %f_window_id%
		Sleep, 100  ; It needs extra time on some dialogs or in some cases.
		ControlSetText, Edit1, %f_text%, ahk_id %f_window_id%
		return
	}
	; else fall through to the bottom of the subroutine to take standard action.
}
else if f_class in ExploreWClass,CabinetWClass  ; In Explorer, switch folders.
{
	if f_Edit1Pos <>   ; And it has an Edit1 control.
	{
		ControlSetText, Edit1, %f_path%, ahk_id %f_window_id%
		; Tekl reported the following: "If I want to change to Folder L:\\folder
		; then the addressbar shows http://www.L:\\folder.com. To solve this,
		; I added a {right} before {Enter}":
		ControlSend, Edit1, {Right}{Enter}, ahk_id %f_window_id%
		return
	}
	; else fall through to the bottom of the subroutine to take standard action.
}
else if f_class = ConsoleWindowClass ; In a console window, CD to that directory
{
	WinActivate, ahk_id %f_window_id% ; Because sometimes the mclick deactivates it.
	SetKeyDelay, 0  ; This will be in effect only for the duration of this thread.
	IfInString, f_path, :  ; It contains a drive letter
	{
		StringLeft, f_path_drive, f_path, 1
		Send %f_path_drive%:{enter}
	}
	Send, cd %f_path%{Enter}
	return
}
; Since the above didn't return, one of the following is true:
; 1) It's an unsupported window type but f_AlwaysShowMenu is y (yes).
; 2) It's a supported type but it lacks an Edit1 control to facilitate the custom
;    action, so instead do the default action below.
Run, Explorer %f_path%  ; Might work on more systems without double quotes.
return
`,
	asmatmel: `; Comments
; This is a comment

; Labels
label1:   ; a label

; Opcodes
LD
OUT

; lowercase
ldi
jmp label1

; Assembler directives
.segment CODE
.word $07d3

; Registers
LD A  ; "A"
LDA label1,x  ; "x"

; Strings
.include "header.asm"

; Numbers
ldi r24,#127
ldi r24,$80f0
ldi r24,#%01011000

; Constants
ldi r16, (0<<PB5)|(1<<PB4)|(1<<PB3)|(1<<PB2)|(1<<PB1)|(1<<PB0)

; Attach an LED (through a 220 ohm resistor) to any of the pins 0-12
; Pin Constant Values (Tested on Arduino UNO)
; PD0 - 0
; PD1 - 1
; PD2 - 2
; PD3 - 3
; PD4 - 4
; PD5 - 5
; PD6 - 6
; PD7 - 7

; PB0 - 8
; PB1 - 9
; PB2 - 10
; PB3 - 11
; PB4 - 12
; PB5 - 13 - System LED

start:

	; Set pins 0-7 to high
	ldi		r17, (1<<PD7)|(1<<PD6)|(1<<PD5)|(1<<PD4)|(1<<PD3)|(1<<PD2)|(1<<PD1)|(1<<PD0)
	out		PORTD, r17

	; Set pins 8-13 to high
	ldi		r16, (1<<PB5)|(1<<PB4)|(1<<PB3)|(1<<PB2)|(1<<PB1)|(1<<PB0)
	out		PORTB, r16

	; Set pins 0-7 to output mode
	ldi		r18, (1<<DDD7)|(1<<DDD6)|(1<<DDD5)|(1<<DDD4)|(1<<DDD3)|(1<<DDD2)|(1<<DDD1)|(1<<DDD0)
	out		DDRD, r18

	; Set pins 8-13 to output mode
	ldi		r19, (1<<DDB5)|(1<<DDB4)|(1<<DDB3)|(1<<DDB2)|(1<<DDB1)|(1<<DDB0)
	out		DDRB, r19

loop:
	rjmp loop ; loop forever
`,
	autoit: `; Comments
; Single-line comment
#comments-start
	Multi-line
	comment
#comments-end
#cs
	Multi-line
	comment
#ce
;#comments-start
	foo()
;#comments-end

; Strings
"foo'bar'baz"
"foo""bar""baz"
'foo"bar"baz'
'foo''bar''baz'

; Numbers
2
4.566
1.5e3
0x4fff

; Booleans
True
False

; Keywords and variables
; Display all the numbers for 1 to 10 but skip displaying  7.
For $i = 1 To 10
	If $i = 7 Then
		ContinueLoop ; Skip displaying the message box when $i is equal to 7.
	EndIf
	MsgBox($MB_SYSTEMMODAL, "", "The value of $i is: " & $i)
Next
`,
	avisynth: `# Full Example
/*
 * Example AviSynth script for PrismJS demonstration.
 * By Zinfidel
 */

SetFilterMTMode("DEFAULT_MT_MODE", MT_MULTI_INSTANCE)
AddAutoloadDir("MAINSCRIPTDIR/programs/plugins")

# Multiplies clip size and changes aspect ratio to 4:3
function CorrectAspectRatio(clip c, int scaleFactor, bool "useNearestNeighbor") {
	useNearestNeighbor = default(useNearestNeighbor, false)
	stretchFactor = (c.Height * (4 / 3)) / c.Width

	return useNearestNeighbor \\
		? c.PointResize(c.Width * scaleFactor * stretchFactor, c.Height * scaleFactor) \\
		: c.Lanczos4Resize(c.Width * scaleFactor * stretchFactor, c.Height * scaleFactor)
}

AviSource("myclip.avi")
last.CorrectAspectRatio(3, yes)


Prefetch(4)
`,
	"avro-idl": `// Full example
// Source: https://avro.apache.org/docs/current/idl.html#example

/**
 * An example protocol in Avro IDL
 */
@namespace("org.apache.avro.test")
protocol Simple {

	@aliases(["org.foo.KindOf"])
	enum Kind {
		FOO,
		BAR, // the bar enum value
		BAZ
	}

	fixed MD5(16);

	record TestRecord {
		@order("ignore")
		string name;

		@order("descending")
		Kind kind;

		MD5 hash;

		union { MD5, null} @aliases(["hash"]) nullableHash;

		array<long> arrayOfLongs;
	}

	error TestError {
		string message;
	}

	string hello(string greeting);
	TestRecord echo(TestRecord \`record\`);
	int add(int arg1, int arg2);
	bytes echoBytes(bytes data);
	void \`error\`() throws TestError;
	void ping() oneway;
}
`,
	awk: `# Full example
# Source: awklang.org
BEGIN { ascetion = bsection = 0 }
$2 ~ /^[aA][0-9]+/ { asection++ }
$2 ~ /^[bB][0-9]+/ { bsection++ }
END { print asection, bsection }
`,
	bash: `# Shebang
#!/bin/bash

# Comments
# This is a comment

# Strings
STRING="Hello World"
'Single and
multi-line strings are supported.'
"Single and
multi-line strings are supported."
cat << EOF
Here-Documents
are also supported
EOF

# Variables
echo $STRING
args=("$@")
echo \${args[0]} \${args[1]} \${args[2]}

# Keywords
for (( i=0;i<$ELEMENTS;i++)); do
	echo \${ARRAY[\${i}]}
done
while read LINE; do
	ARRAY[$count]=$LINE
	((count++))
done
if [ -d $directory ]; then
	echo "Directory exists"
else
	echo "Directory does not exists"
fi

# Some well-known commands
crontab -l -u USER | grep -v 'YOUR JOB COMMAND or PATTERN' | crontab -u USER -

groups user1 user2|cut -d: -f2|xargs -n1|sort|uniq -d

wget -q -O - http://www.example.com/automation/remotescript.sh | bash /dev/stdin parameter1 parameter2

sudo dpkg -i vagrant_1.7.2_x86_64.deb

git pull origin master

sudo gpg --refresh-keys; sudo apt-key update; sudo rm -rf /var/lib/apt/{lists,lists.old}; sudo mkdir -p /var/lib/apt/lists/partial; sudo apt-get clean all; sudo apt-get update
`,
	basic: `! Comments
! This is a comment
REM This is a remark

! Strings
"This a string."
"This is a string with ""quotes"" in it."

! Numbers
42
3.14159
-42
-3.14159
.5
10.
2E10
4.2E-14
-3E+2

! Dartmouth Basic example
5 LET S = 0
10 MAT INPUT V
20 LET N = NUM
30 IF N = 0 THEN 99
40 FOR I = 1 TO N
45 LET S = S + V(I)
50 NEXT I
60 PRINT S/N
70 GO TO 5
99 END

! GW-BASIC example
10 INPUT "What is your name: ", U$
20 PRINT "Hello "; U$
30 INPUT "How many stars do you want: ", N
40 S$ = ""
50 FOR I = 1 TO N
60 S$ = S$ + "*"
70 NEXT I
80 PRINT S$
90 INPUT "Do you want more stars? ", A$
100 IF LEN(A$) = 0 THEN GOTO 90
110 A$ = LEFT$(A$, 1)
120 IF A$ = "Y" OR A$ = "y" THEN GOTO 30
130 PRINT "Goodbye "; U$
140 END

! QuickBASIC example
DECLARE SUB PrintSomeStars (StarCount!)
REM QuickBASIC example
INPUT "What is your name: ", UserName$
PRINT "Hello "; UserName$
DO
	INPUT "How many stars do you want: ", NumStars
	CALL PrintSomeStars(NumStars)
	DO
		INPUT "Do you want more stars? ", Answer$
	LOOP UNTIL Answer$ <> ""
	Answer$ = LEFT$(Answer$, 1)
LOOP WHILE UCASE$(Answer$) = "Y"
PRINT "Goodbye "; UserName$

SUB PrintSomeStars (StarCount)
	REM This procedure uses a local variable called Stars$
	Stars$ = STRING$(StarCount, "*")
	PRINT Stars$
END SUB
`,
	bbcode: `Full example
[list]
[*]Entry A
[*]Entry B
[/list]

[list=1]
[*]Entry 1
[*]Entry 2
[/list]

[style color="fuchsia"]Text in fuchsia[/style] or
[style color=#FF00FF]Text in fuchsia[/style] or
[color=#FF00FF]Text in fuchsia[/color]
[quote]quoted text[/quote]
[quote="author"]quoted text[/quote]

[:-)]

[url]https://en.wikipedia.org[/url]
[url=https://en.wikipedia.org]English Wikipedia[/url]
`,
	batch: `:: Comments
::
:: Foo bar
REM This is a comment too
REM Multi-line ^
comment

:: Labels
:foobar
GOTO :EOF

:: Commands
@ECHO OFF
FOR /l %%a in (5,-1,1) do (TITLE %title% -- closing in %%as)
SET title=%~n0
if /i "%InstSize:~0,1%"=="M" set maxcnt=3
ping -n 2 -w 1 127.0.0.1
`,
	bbj: `REM Routines example
use ::BBjGridExWidget/BBjGridExWidget.bbj::BBjGridExWidget
use com.basiscomponents.db.ResultSet
use com.basiscomponents.bc.SqlQueryBC

declare auto BBjTopLevelWindow wnd!
wnd! = BBjAPI().openSysGui("X0").addWindow(10, 10, 800, 600, "My First Grid")
wnd!.setCallback(BBjAPI.ON_CLOSE,"byebye")

gosub main
process_events

REM Retrieve the data from the database and configure the grid
main:
	declare SqlQueryBC sbc!
	declare ResultSet rs!
	declare BBjGridExWidget grid!

	sbc! = new SqlQueryBC(BBjAPI().getJDBCConnection("CDStore"))
	rs! = sbc!.retrieve("SELECT * FROM CDINVENTORY")

	grid! = new BBjGridExWidget(wnd!, 100, 0, 0, 800, 600)
	grid!.setData(rs!)
return

byebye:
bye

REM OOP example
use java.util.Arrays
use java.util.ArrayList
use ::BBjGridExWidget/BBjGridExWidget.bbj::BBjGridExWidget

REM /**
REM  * This file is part of the MyPackage.
REM  *
REM  * For the full copyright and license information, please view the LICENSE
REM  * file that was distributed with this source code.
REM  */
REM /**

class public Employee
	field public BBjNumber ID
	field public BBjString Name$
classend

class public Salaried extends Employee implements Payable
	field public BBjNumber MonthlySalary
	method public BBjNumber pay()
		methodret #MonthlySalary
	methodend
	method public void print()
		print "Employee",#getID(),": ",#getName()
		print #pay():"($###,###.00)"
	methodend
	method public BBjNumber account()
		methodret 11111
	methodend
classend
`,
	bicep: `// Variable assignment
var foo = 'bar'

// Operators
(1 + 2 * 3)/4 >= 3 && 4 < 5 || 6 > 7

// Keywords
resource appServicePlan 'Microsoft.Web/serverfarms@2020-09-01' existing =  = if (diagnosticsEnabled) {
	name: logAnalyticsWsName
}
module cosmosDb './cosmosdb.bicep' = {
	name: 'cosmosDbDeploy'
}
param env string
var oneNumber = 123
output databaseName string = cosmosdbDatabaseName
for item in cosmosdbAllowedIpAddresses: {
  ipAddressOrRange: item
}
`,
	birb: `// Comments
// Single line comment
/* Block comment
on multiple lines */

// Annotations
<Supersede> // marks an instance member as overriding a superclass

// Numbers
int x = 1;
double y = 1.1;

// Strings
String s1 = 'Strings allow single quotes';
String s2 = "as well as double quotes";
var s2 = 'Birb strings are
	multiline by default';

// Full example
class Birb {
	final String name;
	int age = 19;

	void construct(String newName){
	nest.name = newName;
	}
}
Birb.construct('Yoko');
screm(Birb.name);
`,
	bison: `// Comments
// Single-line comment
/* Multi-line
comment */

// C prologue and Bison declarations
%{
	#include <stdio.h>
	#include <math.h>
	int yylex (void);
	void yyerror (char const *);
%}

%define api.value.type {double}
%token NUM
%union { char *string; }
%%
%%

// Grammar rules
%%
exp:
	NUM           { $$ = $1;           }
| exp exp '+'   { $$ = $1 + $2;      }
| exp exp '-'   { $$ = $1 - $2;      }
| exp exp '*'   { $$ = $1 * $2;      }
| exp exp '/'   { $$ = $1 / $2;      }
| exp exp '^'   { $$ = pow($1, $2);  }  /* Exponentiation */
| exp 'n'       { $$ = -$1;          }  /* Unary minus    */
;

$@1: %empty { a(); };
$@2: %empty { c(); };
$@3: %empty { d(); };
exp: $@1 "b" $@2 $@3 "e" { f(); };
%%

// Full example
/* Mini Calculator */
/* calc.y */

%{
#include "heading.h"
int yyerror(char *s);
int yylex(void);
%}

%union{
	int		int_val;
	string*	op_val;
}

%start	input

%token	<int_val>	INTEGER_LITERAL
%type	<int_val>	exp
%left	PLUS
%left	MULT

%%

input:		/* empty */
		| exp	{ cout << "Result: " << $1 << endl; }
		;

exp:		INTEGER_LITERAL	{ $$ = $1; }
		| exp PLUS exp	{ $$ = $1 + $3; }
		| exp MULT exp	{ $$ = $1 * $3; }
		;

%%

int yyerror(string s)
{
	extern int yylineno;	// defined and maintained in lex.c
	extern char *yytext;	// defined and maintained in lex.c

	cerr << "ERROR: " << s << " at symbol \\"" << yytext;
	cerr << "\\" on line " << yylineno << endl;
	exit(1);
}

int yyerror(char *s)
{
	return yyerror(string(s));
}
`,
	bnf: `Full example
<number>   ::= "+" <unsigned> | "-" <unsigned> | <unsigned>
<unsigned> ::= "NaN" | "Infinity" | <decimal> | <decimal> <exponent>
<decimal>  ::= <integer> | "." <non-zero-integer> | <non-zero-integer> "." | <integer> "." <integer>

<exponent>      ::= <exponent-char> <exponent-sign> <integer>
<exponent-char> ::= "e" | "E"
<exponent-sign> ::= "+" | "-" | ""

<integer>          ::= "0" | <non-zero-integer>
<non-zero-integer> ::= <non-zero-digit> | <non-zero-digit> <digits>

<digits>         ::= <digit> | <digit> <digits>
<digit>          ::= "0" | <non-zero-digit>
<non-zero-digit> ::= "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"

Routing Backus–Naur form
<number>   ::= [ "+" | "-" ] <unsigned>
<unsigned> ::= "NaN" | "Infinity" | <decimal> [ <exponent> ]
<decimal>  ::= <integer> [ "." <integer> ] | "." <non-zero-integer> | <non-zero-integer> "."
<exponent> ::= ( "e" | "E" ) [ "+" | "-" ] <integer>

<integer>          ::= "0" | <non-zero-integer>
<non-zero-integer> ::= <non-zero-digit> [ <digit>... ]

<digit>          ::= "0" | <non-zero-digit>
<non-zero-digit> ::= "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
`,
	bqn: `# 100 Doors
swch ← ≠´{100⥊1«𝕩⥊0}¨1+↕100
¯1↓∾{𝕩∾@+10}¨•Fmt¨⟨swch,/swch⟩

# Archimedean Spiral
{(•math.Sin •Plot○(⊢×↕∘≠) •math.Cos) -(2×π) × 𝕩⥊(↕÷-⟜1)100}

# Damm Algorithm
table ← >⟨ 0‿3‿1‿7‿5‿9‿8‿6‿4‿2
					 7‿0‿9‿2‿1‿5‿4‿8‿6‿3
					 4‿2‿0‿6‿8‿7‿1‿3‿5‿9
					 1‿7‿5‿0‿9‿8‿3‿4‿2‿6
					 6‿1‿2‿3‿0‿4‿5‿9‿7‿8
					 3‿6‿7‿4‿2‿0‿9‿5‿8‿1
					 5‿8‿6‿9‿7‿2‿0‿1‿3‿4
					 8‿9‿4‿5‿3‿6‿2‿0‿1‿7
					 9‿4‿3‿8‿6‿1‿7‿2‿0‿5
					 2‿5‿8‿1‿4‿3‿6‿7‿9‿0 ⟩


Digits ← 10{⌽𝕗|⌊∘÷⟜𝕗⍟(↕1+·⌊𝕗⋆⁼1⌈⊢)}

Damm ← {0=0(table⊑˜⋈)˜´⌽Digits 𝕩}

Damm¨5724‿5727‿112946

# Knuth/Fisher-Yates Shuffle
Knuth ← {
	𝕊 arr:
	l ← ≠arr
	{
		arr ↩ ⌽⌾(⟨•rand.Range l, 𝕩⟩⊸⊏)arr
	}¨↕l
	arr
}
P ← •Show Knuth

P ⟨⟩
P ⟨10⟩
P ⟨10, 20⟩
P ⟨10, 20, 30⟩

# Comments
#!/usr/bin/env bqn
# Full Line Comment
'#'  # The preceding should not be a comment.
"BQN is #1" # The preceding should not be a comment.
1 + 1 # Comment at End of Line.

# Literals
"String Literal"
'c'
"""There is a double quote at the start of this string."
"'c'"
# "Comment, not String"
"String, # Not Comment"
@

# Primitive Functions
+-×÷⋆√⌊⌈|¬∧∨<>≠=≤≥≡≢⊣⊢⥊∾≍⋈↑↓↕«»⌽⍉/⍋⍒⊏⊑⊐⊒∊⍷⊔!

# 1-Operators
˙˜˘¨⌜⁼´˝\`

# 2-Operators
∘○⊸⟜⌾⊘◶⎉⚇⍟⎊

# Special Names
𝕨𝕩𝕗𝕘𝕤𝕎𝕏𝔽𝔾𝕊𝕣_𝕣
_𝕣_

# Punctuation
←⇐↩(){}⟨⟩[]‿·⋄,.;:?

# Numbers
1464
3.14159
¯2
∞
π
¯∞
2.8e¯4
1.618E2

# Names
VariableName
ThereAre4Symbols_¯∞πAllowedInNames

# Namespaces
example.b
{n⇐7}.n

# System Functions
•Function
 •function
•_function_
@•Function@
+•Function+
˙•Function˙
∘•Function∘
𝕨•Function𝕩
←•Function?
•Function_.¯∞πCanHaveSymbols
•0.0.0.0
`,
	brightscript: `' Full example
Function Main()
	MyFunA(4)
	MyFunB(4)
End Function

Function MyFunA(p as Object) as Void
	print "A",p,type(p)
End Function

Function MyFunB(p as Integer) as Void
	print "B",p,type(p)
End Function
`,
	brainfuck: `Full example
+++++ +++             Set Cell #0 to 8
[
	>++++               Add 4 to Cell #1; this will always set Cell #1 to 4
	[                   as the cell will be cleared by the loop
		>++             	Add 2 to Cell #2
		>+++            	Add 3 to Cell #3
		>+++            	Add 3 to Cell #4
		>+              	Add 1 to Cell #5
		<<<<-           	Decrement the loop counter in Cell #1
	]                   Loop till Cell #1 is zero; number of iterations is 4
	>+                  Add 1 to Cell #2
	>+                  Add 1 to Cell #3
	>-                  Subtract 1 from Cell #4
	>>+                 Add 1 to Cell #6
	[<]                 Move back to the first zero cell you find; this will
											be Cell #1 which was cleared by the previous loop
	<-                  Decrement the loop Counter in Cell #0
]                     Loop till Cell #0 is zero; number of iterations is 8

The result of this is:
Cell No :   0   1   2   3   4   5   6
Contents:   0   0  72 104  88  32   8
Pointer :   ^

>>.                   Cell #2 has value 72 which is 'H'
>---.                 Subtract 3 from Cell #3 to get 101 which is 'e'
+++++++..+++.         Likewise for 'llo' from Cell #3
>>.                   Cell #5 is 32 for the space
<-.                   Subtract 1 from Cell #4 for 87 to give a 'W'
<.                    Cell #3 was set to 'o' from the end of 'Hello'
+++.------.--------.  Cell #3 for 'rl' and 'd'
>>+.                  Add 1 to Cell #5 gives us an exclamation point
>++.                  And finally a newline from Cell #6

One-line example
++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.
`,
	c: `// Strings
"foo \\"bar\\" baz"
'foo \\'bar\\' baz'
"Multi-line strings ending with a \\
are supported too."

// Macro statements
# include <stdio.h>
#define PG_locked   0
#define PG_error    1

// Full example
#include <stdio.h>
main(int argc, char *argv[])
{
	int c;
	printf("Number of command line arguments passed: %d\\n", argc);
	for ( c = 0 ; c < argc ; c++)
		printf("%d. Command line argument passed is %s\\n", c+1, argv[c]);
	return 0;
}
`,
	bro: `# Comments
# Single line comment

# Strings
"a", "b"

# Numbers
123
123.456
-123.456

# Misc
@ifndef ourexp
@load-sigs somesigs

# Full example
##! Scan detector ported from Bro 1.x.
##!
##! This script has evolved over many years and is quite a mess right now. We
##! have adapted it to work with Bro 2.x, but eventually Bro 2.x will
##! get its own rewritten and generalized scan detector.

@load base/frameworks/notice/main

module Scan;

export {
	redef enum Notice::Type += {
		## The source has scanned a number of ports.
		PortScan,
		## The source has scanned a number of addresses.
		AddressScan,
		## Apparent flooding backscatter seen from source.
		BackscatterSeen,

		## Summary of scanning activity.
		ScanSummary,
		## Summary of distinct ports per scanner.
		PortScanSummary,
		## Summary of distinct low ports per scanner.
		LowPortScanSummary,

		## Source reached :bro:id:\`Scan::shut_down_thresh\`
		ShutdownThresh,
		## Source touched privileged ports.
		LowPortTrolling,
	};

	# Whether to consider UDP "connections" for scan detection.
	# Can lead to false positives due to UDP fanout from some P2P apps.
	const suppress_UDP_scan_checks = F &redef;

	const activate_priv_port_check = T &redef;
	const activate_landmine_check = F &redef;
	const landmine_thresh_trigger = 5 &redef;

	const landmine_address: set[addr] &redef;

	const scan_summary_trigger = 25 &redef;
	const port_summary_trigger = 20 &redef;
	const lowport_summary_trigger = 10 &redef;

	# Raise ShutdownThresh after this many failed attempts
	const shut_down_thresh = 100 &redef;

	# Which services should be analyzed when detecting scanning
	# (not consulted if analyze_all_services is set).
	const analyze_services: set[port] &redef;
	const analyze_all_services = T &redef;

	# Track address scaners only if at least these many hosts contacted.
	const addr_scan_trigger = 0 &redef;

	# Ignore address scanners for further scan detection after
	# scanning this many hosts.
	# 0 disables.
	const ignore_scanners_threshold = 0 &redef;

	# Report a scan of peers at each of these points.
	const report_peer_scan: vector of count = {
		20, 100, 1000, 10000, 50000, 100000, 250000, 500000, 1000000,
	} &redef;

	const report_outbound_peer_scan: vector of count = {
		100, 1000, 10000,
	} &redef;

	# Report a scan of ports at each of these points.
	const report_port_scan: vector of count = {
		50, 250, 1000, 5000, 10000, 25000, 65000,
	} &redef;

	# Once a source has scanned this many different ports (to however many
	# different remote hosts), start tracking its per-destination access.
	const possible_port_scan_thresh = 20 &redef;

	# Threshold for scanning privileged ports.
	const priv_scan_trigger = 5 &redef;
	const troll_skip_service = {
		25/tcp, 21/tcp, 22/tcp, 20/tcp, 80/tcp,
	} &redef;

	const report_accounts_tried: vector of count = {
		20, 100, 1000, 10000, 100000, 1000000,
	} &redef;

	const report_remote_accounts_tried: vector of count = {
		100, 500,
	} &redef;

	# Report a successful password guessing if the source attempted
	# at least this many.
	const password_guessing_success_threshhold = 20 &redef;

	const skip_accounts_tried: set[addr] &redef;

	const addl_web = {
		81/tcp, 443/tcp, 8000/tcp, 8001/tcp, 8080/tcp, }
	&redef;

	const skip_services = { 113/tcp, } &redef;
	const skip_outbound_services = { 21/tcp, addl_web, }
		&redef;

	const skip_scan_sources = {
		255.255.255.255,	# who knows why we see these, but we do
	} &redef;

	const skip_scan_nets: set[subnet] = {} &redef;

	# List of well known local server/ports to exclude for scanning
	# purposes.
	const skip_dest_server_ports: set[addr, port] = {} &redef;

	# Reverse (SYN-ack) scans seen from these ports are considered
	# to reflect possible SYN-flooding backscatter, and not true
	# (stealth) scans.
	const backscatter_ports = {
		80/tcp, 8080/tcp, 53/tcp, 53/udp, 179/tcp, 6666/tcp, 6667/tcp,
	} &redef;

	const report_backscatter: vector of count = {
		20,
	} &redef;

	global check_scan:
		function(c: connection, established: bool, reverse: bool): bool;

	# The following tables are defined here so that we can redef
	# the expire timeouts.
	# FIXME: should we allow redef of attributes on IDs which
	# are not exported?

	# How many different hosts connected to with a possible
	# backscatter signature.
	global distinct_backscatter_peers: table[addr] of table[addr] of count
		&read_expire = 15 min;

	# Expire functions that trigger summaries.
	global scan_summary:
		function(t: table[addr] of set[addr], orig: addr): interval;
	global port_summary:
		function(t: table[addr] of set[port], orig: addr): interval;
	global lowport_summary:
		function(t: table[addr] of set[port], orig: addr): interval;

	# Indexed by scanner address, yields # distinct peers scanned.
	# pre_distinct_peers tracks until addr_scan_trigger hosts first.
	global pre_distinct_peers: table[addr] of set[addr]
		&read_expire = 15 mins &redef;

	global distinct_peers: table[addr] of set[addr]
		&read_expire = 15 mins &expire_func=scan_summary &redef;
	global distinct_ports: table[addr] of set[port]
		&read_expire = 15 mins &expire_func=port_summary &redef;
	global distinct_low_ports: table[addr] of set[port]
		&read_expire = 15 mins &expire_func=lowport_summary &redef;

	# Indexed by scanner address, yields a table with scanned hosts
	# (and ports).
	global scan_triples: table[addr] of table[addr] of set[port];

	global remove_possible_source:
		function(s: set[addr], idx: addr): interval;
	global possible_scan_sources: set[addr]
		&expire_func=remove_possible_source &read_expire = 15 mins;

	# Indexed by source address, yields user name & password tried.
	global accounts_tried: table[addr] of set[string, string]
		&read_expire = 1 days;

	global ignored_scanners: set[addr] &create_expire = 1 day &redef;

	# These tables track whether a threshold has been reached.
	# More precisely, the counter is the next index of threshold vector.
	global shut_down_thresh_reached: table[addr] of bool &default=F;
	global rb_idx: table[addr] of count
			&default=1 &read_expire = 1 days &redef;
	global rps_idx: table[addr] of count
			&default=1 &read_expire = 1 days &redef;
	global rops_idx: table[addr] of count
			&default=1 &read_expire = 1 days &redef;
	global rpts_idx: table[addr,addr] of count
			&default=1 &read_expire = 1 days &redef;
	global rat_idx: table[addr] of count
			&default=1 &read_expire = 1 days &redef;
	global rrat_idx: table[addr] of count
			&default=1 &read_expire = 1 days &redef;
}

global thresh_check: function(v: vector of count, idx: table[addr] of count,
				orig: addr, n: count): bool;
global thresh_check_2: function(v: vector of count,
				idx: table[addr,addr] of count, orig: addr,
				resp: addr, n: count): bool;

function scan_summary(t: table[addr] of set[addr], orig: addr): interval
	{
	local num_distinct_peers = orig in t ? |t[orig]| : 0;

	if ( num_distinct_peers >= scan_summary_trigger )
		NOTICE([$note=ScanSummary, $src=orig, $n=num_distinct_peers,
			$identifier=fmt("%s", orig),
			$msg=fmt("%s scanned a total of %d hosts",
					orig, num_distinct_peers)]);

	return 0 secs;
	}

function port_summary(t: table[addr] of set[port], orig: addr): interval
	{
	local num_distinct_ports = orig in t ? |t[orig]| : 0;

	if ( num_distinct_ports >= port_summary_trigger )
		NOTICE([$note=PortScanSummary, $src=orig, $n=num_distinct_ports,
			$identifier=fmt("%s", orig),
			$msg=fmt("%s scanned a total of %d ports",
					orig, num_distinct_ports)]);

	return 0 secs;
	}

function lowport_summary(t: table[addr] of set[port], orig: addr): interval
	{
	local num_distinct_lowports = orig in t ? |t[orig]| : 0;

	if ( num_distinct_lowports >= lowport_summary_trigger )
		NOTICE([$note=LowPortScanSummary, $src=orig,
			$n=num_distinct_lowports,
			$identifier=fmt("%s", orig),
			$msg=fmt("%s scanned a total of %d low ports",
					orig, num_distinct_lowports)]);

	return 0 secs;
	}

function clear_addr(a: addr)
	{
	delete distinct_peers[a];
	delete distinct_ports[a];
	delete distinct_low_ports[a];
	delete scan_triples[a];
	delete possible_scan_sources[a];
	delete distinct_backscatter_peers[a];
	delete pre_distinct_peers[a];
	delete rb_idx[a];
	delete rps_idx[a];
	delete rops_idx[a];
	delete rat_idx[a];
	delete rrat_idx[a];
	delete shut_down_thresh_reached[a];
	delete ignored_scanners[a];
	}

function ignore_addr(a: addr)
	{
	clear_addr(a);
	add ignored_scanners[a];
	}

function check_scan(c: connection, established: bool, reverse: bool): bool
	{
	local id = c$id;

	local service = "ftp-data" in c$service ? 20/tcp
			: (reverse ? id$orig_p : id$resp_p);
	local rev_service = reverse ? id$resp_p : id$orig_p;
	local orig = reverse ? id$resp_h : id$orig_h;
	local resp = reverse ? id$orig_h : id$resp_h;
	local outbound = Site::is_local_addr(orig);

	# The following works better than using get_conn_transport_proto()
	# because c might not correspond to an active connection (which
	# causes the function to fail).
	if ( suppress_UDP_scan_checks &&
	     service >= 0/udp && service <= 65535/udp )
		return F;

	if ( service in skip_services && ! outbound )
		return F;

	if ( outbound && service in skip_outbound_services )
		return F;

	if ( orig in skip_scan_sources )
		return F;

	if ( orig in skip_scan_nets )
		return F;

	# Don't include well known server/ports for scanning purposes.
	if ( ! outbound && [resp, service] in skip_dest_server_ports )
		return F;

	if ( orig in ignored_scanners)
		return F;

	if ( ! established &&
		# not established, service not expressly allowed

		# not known peer set
		(orig !in distinct_peers || resp !in distinct_peers[orig]) &&

		# want to consider service for scan detection
		(analyze_all_services || service in analyze_services) )
		{
		if ( reverse && rev_service in backscatter_ports &&
		     # reverse, non-priv backscatter port
		     service >= 1024/tcp )
			{
			if ( orig !in distinct_backscatter_peers )
				{
				local empty_bs_table:
					table[addr] of count &default=0;
				distinct_backscatter_peers[orig] =
					empty_bs_table;
				}

			if ( ++distinct_backscatter_peers[orig][resp] <= 2 &&
			     # The test is <= 2 because we get two check_scan()
			     # calls, once on connection attempt and once on
			     # tear-down.

			     distinct_backscatter_peers[orig][resp] == 1 &&

			     # Looks like backscatter, and it's not scanning
			     # a privileged port.

			     thresh_check(report_backscatter, rb_idx, orig,
					|distinct_backscatter_peers[orig]|)
			   )
				{
				NOTICE([$note=BackscatterSeen, $src=orig,
					$p=rev_service,
					$identifier=fmt("%s", orig),
					$msg=fmt("backscatter seen from %s (%d hosts; %s)",
						orig, |distinct_backscatter_peers[orig]|, rev_service)]);
				}

			if ( ignore_scanners_threshold > 0 &&
			     |distinct_backscatter_peers[orig]| >
					ignore_scanners_threshold )
				ignore_addr(orig);
			}

		else
			{ # done with backscatter check
			local ignore = F;

			if ( orig !in distinct_peers && addr_scan_trigger > 0 )
				{
				if ( orig !in pre_distinct_peers )
					pre_distinct_peers[orig] = set();

				add pre_distinct_peers[orig][resp];
				if ( |pre_distinct_peers[orig]| < addr_scan_trigger )
					ignore = T;
				}

			if ( ! ignore )
				{ # XXXXX

				if ( orig !in distinct_peers )
					distinct_peers[orig] = set() &mergeable;

				if ( resp !in distinct_peers[orig] )
					add distinct_peers[orig][resp];

				local n = |distinct_peers[orig]|;

				# Check for threshold if not outbound.
				if ( ! shut_down_thresh_reached[orig] &&
				     n >= shut_down_thresh &&
				     ! outbound && orig !in Site::neighbor_nets )
					{
					shut_down_thresh_reached[orig] = T;
					local msg = fmt("shutdown threshold reached for %s", orig);
					NOTICE([$note=ShutdownThresh, $src=orig,
						$identifier=fmt("%s", orig),
						$p=service, $msg=msg]);
					}

				else
					{
					local address_scan = F;
					if ( outbound &&
					     # inside host scanning out?
					     thresh_check(report_outbound_peer_scan, rops_idx, orig, n) )
						address_scan = T;

					if ( ! outbound &&
					     thresh_check(report_peer_scan, rps_idx, orig, n) )
						address_scan = T;

					if ( address_scan )
						NOTICE([$note=AddressScan,
							$src=orig, $p=service,
							$n=n,
							$identifier=fmt("%s-%d", orig, n),
							$msg=fmt("%s has scanned %d hosts (%s)",
								orig, n, service)]);

					if ( address_scan &&
					     ignore_scanners_threshold > 0 &&
					     n > ignore_scanners_threshold )
						ignore_addr(orig);
					}
				}
			} # XXXX
		}

	if ( established )
		# Don't consider established connections for port scanning,
		# it's too easy to be mislead by FTP-like applications that
		# legitimately gobble their way through the port space.
		return F;

	# Coarse search for port-scanning candidates: those that have made
	# connections (attempts) to possible_port_scan_thresh or more
	# distinct ports.
	if ( orig !in distinct_ports || service !in distinct_ports[orig] )
		{
		if ( orig !in distinct_ports )
			distinct_ports[orig] = set() &mergeable;

		if ( service !in distinct_ports[orig] )
			add distinct_ports[orig][service];

		if ( |distinct_ports[orig]| >= possible_port_scan_thresh &&
			orig !in scan_triples )
			{
			scan_triples[orig] = table() &mergeable;
			add possible_scan_sources[orig];
			}
		}

	# Check for low ports.
	if ( activate_priv_port_check && ! outbound && service < 1024/tcp &&
	     service !in troll_skip_service )
		{
		if ( orig !in distinct_low_ports ||
		     service !in distinct_low_ports[orig] )
			{
			if ( orig !in distinct_low_ports )
				distinct_low_ports[orig] = set() &mergeable;

			add distinct_low_ports[orig][service];

			if ( |distinct_low_ports[orig]| == priv_scan_trigger &&
			     orig !in Site::neighbor_nets )
				{
				local svrc_msg = fmt("low port trolling %s %s", orig, service);
				NOTICE([$note=LowPortTrolling, $src=orig,
					$identifier=fmt("%s", orig),
					$p=service, $msg=svrc_msg]);
				}

			if ( ignore_scanners_threshold > 0 &&
			     |distinct_low_ports[orig]| >
					ignore_scanners_threshold )
				ignore_addr(orig);
			}
		}

	# For sources that have been identified as possible scan sources,
	# keep track of per-host scanning.
	if ( orig in possible_scan_sources )
		{
		if ( orig !in scan_triples )
			scan_triples[orig] = table() &mergeable;

		if ( resp !in scan_triples[orig] )
			scan_triples[orig][resp] = set() &mergeable;

		if ( service !in scan_triples[orig][resp] )
			{
			add scan_triples[orig][resp][service];

			if ( thresh_check_2(report_port_scan, rpts_idx,
					    orig, resp,
					    |scan_triples[orig][resp]|) )
				{
				local m = |scan_triples[orig][resp]|;
				NOTICE([$note=PortScan, $n=m, $src=orig,
					$p=service,
					$identifier=fmt("%s-%d", orig, n),
					$msg=fmt("%s has scanned %d ports of %s",
					orig, m, resp)]);
				}
			}
		}

	return T;
	}


# Hook into the catch&release dropping. When an address gets restored, we reset
# the source to allow dropping it again.
event Drop::address_restored(a: addr)
	{
	clear_addr(a);
	}

event Drop::address_cleared(a: addr)
	{
	clear_addr(a);
	}

# When removing a possible scan source, we automatically delete its scanned
# hosts and ports.  But we do not want the deletion propagated, because every
# peer calls the expire_function on its own (and thus applies the delete
# operation on its own table).
function remove_possible_source(s: set[addr], idx: addr): interval
	{
	suspend_state_updates();
	delete scan_triples[idx];
	resume_state_updates();

	return 0 secs;
	}

# To recognize whether a certain threshhold vector (e.g. report_peer_scans)
# has been transgressed, a global variable containing the next vector index
# (idx) must be incremented.  This cumbersome mechanism is necessary because
# values naturally don't increment by one (e.g. replayed table merges).
function thresh_check(v: vector of count, idx: table[addr] of count,
			orig: addr, n: count): bool
	{
	if ( ignore_scanners_threshold > 0 && n > ignore_scanners_threshold )
		{
		ignore_addr(orig);
		return F;
		}

	if ( idx[orig] <= |v| && n >= v[idx[orig]] )
		{
		++idx[orig];
		return T;
		}
	else
		return F;
	}

# Same as above, except the index has a different type signature.
function thresh_check_2(v: vector of count, idx: table[addr, addr] of count,
			orig: addr, resp: addr, n: count): bool
	{
	if ( ignore_scanners_threshold > 0 && n > ignore_scanners_threshold )
		{
		ignore_addr(orig);
		return F;
		}

	if ( idx[orig,resp] <= |v| && n >= v[idx[orig, resp]] )
		{
		++idx[orig,resp];
		return T;
		}
	else
		return F;
	}

event connection_established(c: connection)
	{
	local is_reverse_scan = (c$orig$state == TCP_INACTIVE);
	Scan::check_scan(c, T, is_reverse_scan);
	}

event partial_connection(c: connection)
	{
	Scan::check_scan(c, T, F);
	}

event connection_attempt(c: connection)
	{
	Scan::check_scan(c, F, c$orig$state == TCP_INACTIVE);
	}

event connection_half_finished(c: connection)
	{
	# Half connections never were "established", so do scan-checking here.
	Scan::check_scan(c, F, F);
	}

event connection_rejected(c: connection)
	{
	local is_reverse_scan = c$orig$state == TCP_RESET;

	Scan::check_scan(c, F, is_reverse_scan);
	}

event connection_reset(c: connection)
	{
	if ( c$orig$state == TCP_INACTIVE || c$resp$state == TCP_INACTIVE )
		# We never heard from one side - that looks like a scan.
		Scan::check_scan(c, c$orig$size + c$resp$size > 0,
				c$orig$state == TCP_INACTIVE);
	}

event connection_pending(c: connection)
	{
	if ( c$orig$state == TCP_PARTIAL && c$resp$state == TCP_INACTIVE )
		Scan::check_scan(c, F, F);
	}

# Report the remaining entries in the tables.
event bro_done()
	{
	for ( orig in distinct_peers )
		scan_summary(distinct_peers, orig);

	for ( orig in distinct_ports )
		port_summary(distinct_ports, orig);

	for ( orig in distinct_low_ports )
		lowport_summary(distinct_low_ports, orig);
	}
`,
	cfscript: `// Comments
// This is a comment

/* This is a comment
on multiple lines */

/**
* This is a Javadoc style comment
*
* @hint This is an annotation
*/

// Functions
public boolean function myFunc(required any arg) {
	return true;
}

// Full example
component accessors="true" {
	property type="string" name="prop1" default="";
	property string prop2;
	function init(){
		this.prop3 = 12;
		return this;
	}

	/**
	* @hint Annotations supported
	* @foo.hint
	*/
	public any function build( required foo, color="blue", boolean bar=true ){
		arguments.foo = {
			'name' : "something",
			test = true
		}
		var foobar = function( required string baz, x=true, y=false ){
			return "bar!";
		};
		return foo;
	}
}
`,
	chaiscript: `// Full example
// http://chaiscript.com/examples.html#ChaiScript_Language_Examples
// Source: https://gist.github.com/lefticus/cf058f2927fef68d58e0#file-chaiscript_overview-chai

// ChaiScript supports the normal kind of control blocks you've come to expect from
// C++ and JavaScript


if (5 > 2) {
	print("Yup, 5 > 2");
} else if (2 > 5) {
	// never gonna happen
} else {
	// really not going to happen
}

var x = true;

while (x)
{
	print("x was true")
	x = false;
}

for (var i = 1; i < 10; ++i)
{
	print(i); // prints 1 through 9
}


// function definition

def myFunc(x) {
	print(x);
}

// function definition with function guards
def myFunc(x) : x > 2 && x < 5 {
	print(to_string(x) + " is between 2 and 5")
}

def myFunc(x) : x >= 5 {
	print(t_string(x) + " is greater than or equal to 5")
}

myFunc(3)

// ChaiScript also supports in string evaluation, which C++ does not

print("\${3 + 5} is 8");

// And dynamic code evaluation

var value = eval("4 + 2 + 12");

// value is equal to 18
`,
	cil: `// Full example
// Metadata version: v4.0.30319
.assembly extern mscorlib
{
	.publickeytoken = (B7 7A 5C 56 19 34 E0 89 )                         // .z\\V.4..
	.ver 4:0:0:0
}
.assembly i1ohgbkl
{
	.hash algorithm 0x00008004
	.ver 0:0:0:0
}
.module i1ohgbkl.dll
// MVID: {AC981AA1-16FE-413D-BBED-D83AE719F45C}
.imagebase 0x10000000
.file alignment 0x00000200
.stackreserve 0x00100000
.subsystem 0x0003       // WINDOWS_CUI
.corflags 0x00000001    //  ILONLY
// Image base: 0x017C0000
​
​
// =============== CLASS MEMBERS DECLARATION ===================
​
.class public auto ansi beforefieldinit Program
			 extends [mscorlib]System.Object
{
	.method public hidebysig static void  Main() cil managed
	{
		//
		.maxstack  8
		IL_0000:  nop
		IL_0001:  ldstr      "Hello World"
		IL_0006:  call       void [mscorlib]System.Console::WriteLine(string)
		IL_000b:  nop
		IL_000c:  ret
	} // end of method Program::Main
​
	.method public hidebysig specialname rtspecialname
					instance void  .ctor() cil managed
	{
		//
		.maxstack  8
		IL_0000:  ldarg.0
		IL_0001:  call       instance void [mscorlib]System.Object::.ctor()
		IL_0006:  ret
	} // end of method Program::.ctor
​
} // end of class Program
`,
	bsl: `// Comments
// This is a 1C:Enterprise comments
//

// Strings and characters
"This is a 1C:Enterprise string"
""
"a"
"A tabulator character: ""#9"" is easy to embed"

// Numbers
123
123.456

// Full example
///////////////////////////////////////////////////////////////////////////////////////////////////////
// Copyright (c) 2019, ООО 1С-Софт
// Все права защищены. Эта программа и сопроводительные материалы предоставляются 
// в соответствии с условиями лицензии Attribution 4.0 International (CC BY 4.0)
// Текст лицензии доступен по ссылке:
// https://creativecommons.org/licenses/by/4.0/legalcode
///////////////////////////////////////////////////////////////////////////////////////////////////////

#Область СлужебныеПроцедурыИФункции

////////////////////////////////////////////////////////////////////////////////
//  Основные процедуры и функции поиска контактов.

// Получает представление и всю контактную информацию контакта.
//
// Параметры:
//  Контакт                 - ОпределяемыйТип.КонтактВзаимодействия - контакт для которого получается информация.
//  Представление           - Строка - в данный параметр будет помещено полученное представление.
//  СтрокаКИ                - Строка - в данный параметр будет помещено полученная контактная информация.
//  ТипКонтактнойИнформации - Перечисления.ТипыКонтактнойИнформации - возможность установить отбор по типу получаемой
//                                                                    контактной информации.
//
Процедура ПредставлениеИВсяКонтактнаяИнформациюКонтакта(Контакт, Представление, СтрокаКИ,ТипКонтактнойИнформации = Неопределено) Экспорт
	
	Представление = "";
	СтрокаКИ = "";
	Если Не ЗначениеЗаполнено(Контакт) 
		ИЛИ ТипЗнч(Контакт) = Тип("СправочникСсылка.СтроковыеКонтактыВзаимодействий") Тогда
		Контакт = Неопределено;
		Возврат;
	КонецЕсли;
	
	ИмяТаблицы = Контакт.Метаданные().Имя;
	ИмяПоляДляНаименованияВладельца = Взаимодействия.ИмяПоляДляНаименованияВладельца(ИмяТаблицы);
	
	Запрос = Новый Запрос;
	Запрос.Текст =
	"ВЫБРАТЬ
	|	СправочникКонтакт.Наименование          КАК Наименование,
	|	" + ИмяПоляДляНаименованияВладельца + " КАК НаименованиеВладельца
	|ИЗ
	|	Справочник." + ИмяТаблицы + " КАК СправочникКонтакт
	|ГДЕ
	|	СправочникКонтакт.Ссылка = &Контакт
	|";
	
	Запрос.УстановитьПараметр("Контакт", Контакт);
	Запрос.УстановитьПараметр("ТипКонтактнойИнформации", ТипКонтактнойИнформации);
	Выборка = Запрос.Выполнить().Выбрать();
	Если Не Выборка.Следующий() Тогда
		Возврат;
	КонецЕсли;
	
	Представление = Выборка.Наименование;
	
	Если Не ПустаяСтрока(Выборка.НаименованиеВладельца) Тогда
		Представление = Представление + " (" + Выборка.НаименованиеВладельца + ")";
	КонецЕсли;
	
	МассивКонтактов = ОбщегоНазначенияКлиентСервер.ЗначениеВМассиве(Контакт);
	ТаблицаКИ = УправлениеКонтактнойИнформацией.КонтактнаяИнформацияОбъектов(МассивКонтактов, ТипКонтактнойИнформации, Неопределено, ТекущаяДатаСеанса());
	
	Для Каждого СтрокаТаблицы Из ТаблицаКИ Цикл
		Если СтрокаТаблицы.Тип <> Перечисления.ТипыКонтактнойИнформации.Другое Тогда
			СтрокаКИ = СтрокаКИ + ?(ПустаяСтрока(СтрокаКИ), "", "; ") + СтрокаТаблицы.Представление;
		КонецЕсли;
	КонецЦикла;
	
КонецПроцедуры

// Получает наименование и адреса электронной почты контакта.
//
// Параметры:
//  Контакт - Ссылка - контакт, для которого получаются данные.
//
// Возвращаемое значение:
//  Структура - содержит наименование контакта и список значений электронной почты контакта.
//
Функция НаименованиеИАдресаЭлектроннойПочтыКонтакта(Контакт) Экспорт
	
	Если Не ЗначениеЗаполнено(Контакт) 
		Или ТипЗнч(Контакт) = Тип("СправочникСсылка.СтроковыеКонтактыВзаимодействий") Тогда
		Возврат Неопределено;
	КонецЕсли;
	
	МетаданныеКонтакта = Контакт.Метаданные();
	
	Если МетаданныеКонтакта.Иерархический Тогда
		Если Контакт.ЭтоГруппа Тогда
			Возврат Неопределено;
		КонецЕсли;
	КонецЕсли;
	
	МассивОписанияТиповКонтактов = ВзаимодействияКлиентСервер.ОписанияКонтактов();
	ЭлементМассиваОписания = Неопределено;
	Для Каждого ЭлементМассива Из МассивОписанияТиповКонтактов Цикл
		
		Если ЭлементМассива.Имя = МетаданныеКонтакта.Имя Тогда
			ЭлементМассиваОписания = ЭлементМассива;
			Прервать;
		КонецЕсли;
		
	КонецЦикла;
	
	Если ЭлементМассиваОписания = Неопределено Тогда
		Возврат Неопределено;
	КонецЕсли;
	
	ИмяТаблицы = МетаданныеКонтакта.ПолноеИмя();
	
	ТекстЗапроса =
	"ВЫБРАТЬ РАЗРЕШЕННЫЕ РАЗЛИЧНЫЕ
	|	ЕСТЬNULL(ТаблицаКонтактнаяИнформация.АдресЭП,"""") КАК АдресЭП,
	|	СправочникКонтакт." + ЭлементМассиваОписания.ИмяРеквизитаПредставлениеКонтакта + " КАК Наименование
	|ИЗ
	|	" + ИмяТаблицы + " КАК СправочникКонтакт
	|		ЛЕВОЕ СОЕДИНЕНИЕ " + ИмяТаблицы + ".КонтактнаяИнформация КАК ТаблицаКонтактнаяИнформация
	|		ПО (ТаблицаКонтактнаяИнформация.Ссылка = СправочникКонтакт.Ссылка)
	|			И (ТаблицаКонтактнаяИнформация.Тип = ЗНАЧЕНИЕ(Перечисление.ТипыКонтактнойИнформации.АдресЭлектроннойПочты))
	|ГДЕ
	|	СправочникКонтакт.Ссылка = &Контакт
	|ИТОГИ ПО
	|	Наименование";
	
	Запрос = Новый Запрос;
	Запрос.Текст = ТекстЗапроса;
	Запрос.УстановитьПараметр("Контакт", Контакт);
	Выборка = Запрос.Выполнить().Выбрать(ОбходРезультатаЗапроса.ПоГруппировкам);
	
	Если Не Выборка.Следующий() Тогда
		Возврат Неопределено;
	КонецЕсли;
	
	Адреса = Новый Структура("Наименование,Адреса", Выборка.Наименование, Новый СписокЗначений);
	ВыборкаАдреса = Выборка.Выбрать();
	Пока ВыборкаАдреса.Следующий() Цикл
		Адреса.Адреса.Добавить(ВыборкаАдреса.АдресЭП);
	КонецЦикла;
	
	Возврат Адреса;
	
КонецФункции

// Получает адреса электронной почты контакта.
//
// Параметры:
//  Контакт - ОпределяемыйТип.КонтактВзаимодействия - контакт, для которого получаются данные.
//
// Возвращаемое значение:
//  Массив - массив структур содержащих адреса, виды и представления адресов.
//
Функция ПолучитьАдресаЭлектроннойПочтыКонтакта(Контакт, ВключатьНезаполненныеВиды = Ложь) Экспорт
	
	Если Не ЗначениеЗаполнено(Контакт) Тогда
		Возврат Неопределено;
	КонецЕсли;
	
	Запрос = Новый Запрос;
	ИмяМетаданныхКонтакта = Контакт.Метаданные().Имя;
	
	Если ВключатьНезаполненныеВиды Тогда
		
		Запрос.Текст =
		"ВЫБРАТЬ
		|	ВидыКонтактнойИнформации.Ссылка КАК Вид,
		|	ВидыКонтактнойИнформации.Наименование КАК ВидНаименование,
		|	Контакты.Ссылка КАК Контакт
		|ПОМЕСТИТЬ КонтактВидыКИ
		|ИЗ
		|	Справочник.ВидыКонтактнойИнформации КАК ВидыКонтактнойИнформации,
		|	Справочник." + ИмяМетаданныхКонтакта + " КАК Контакты
		|ГДЕ
		|	ВидыКонтактнойИнформации.Родитель = &ГруппаВидаКонтактнойИнформации
		|	И Контакты.Ссылка = &Контакт
		|	И ВидыКонтактнойИнформации.Тип = ЗНАЧЕНИЕ(Перечисление.ТипыКонтактнойИнформации.АдресЭлектроннойПочты)
		|;
		|
		|////////////////////////////////////////////////////////////////////////////////
		|ВЫБРАТЬ
		|	Представление(КонтактВидыКИ.Контакт) КАК Представление,
		|	ЕСТЬNULL(КонтактнаяИнформация.АдресЭП, """") КАК АдресЭП,
		|	КонтактВидыКИ.Вид,
		|	КонтактВидыКИ.ВидНаименование
		|ИЗ
		|	КонтактВидыКИ КАК КонтактВидыКИ
		|		ЛЕВОЕ СОЕДИНЕНИЕ Справочник." + ИмяМетаданныхКонтакта + ".КонтактнаяИнформация КАК КонтактнаяИнформация
		|		ПО (КонтактнаяИнформация.Ссылка = КонтактВидыКИ.Контакт)
		|			И (КонтактнаяИнформация.Вид = КонтактВидыКИ.Вид)";
		
		ГруппаВидаКонтактнойИнформации = УправлениеКонтактнойИнформацией.ВидКонтактнойИнформацииПоИмени("Справочник" + ИмяМетаданныхКонтакта);
		Запрос.УстановитьПараметр("ГруппаВидаКонтактнойИнформации", ГруппаВидаКонтактнойИнформации);
	Иначе
		
		Запрос.Текст =
		"ВЫБРАТЬ
		|	Таблицы.АдресЭП,
		|	Таблицы.Вид,
		|	Таблицы.Представление,
		|	Таблицы.Вид.Наименование КАК ВидНаименование
		|ИЗ
		|	Справочник." + ИмяМетаданныхКонтакта + ".КонтактнаяИнформация КАК Таблицы
		|ГДЕ
		|	Таблицы.Ссылка = &Контакт
		|	И Таблицы.Тип = ЗНАЧЕНИЕ(Перечисление.ТипыКонтактнойИнформации.АдресЭлектроннойПочты)";
		
	КонецЕсли;
	
	Запрос.УстановитьПараметр("Контакт", Контакт);
	
	Выборка = Запрос.Выполнить().Выбрать();
	Если Выборка.Количество() = 0 Тогда
		Возврат Новый Массив;
	КонецЕсли;
	
	Результат = Новый Массив;
	Пока Выборка.Следующий() Цикл
		Адрес = Новый Структура;
		Адрес.Вставить("АдресЭП",         Выборка.АдресЭП);
		Адрес.Вставить("Вид",             Выборка.Вид);
		Адрес.Вставить("Представление",   Выборка.Представление);
		Адрес.Вставить("ВидНаименование", Выборка.ВидНаименование);
		Результат.Добавить(Адрес);
	КонецЦикла;
	
	Возврат Результат;
	
КонецФункции

Функция ОтправитьПолучитьПочтуПользователяВФоне(УникальныйИдентификатор) Экспорт
	
	ПараметрыПроцедуры = Новый Структура;
	
	ПараметрыВыполнения = ДлительныеОперации.ПараметрыВыполненияВФоне(УникальныйИдентификатор);
	ПараметрыВыполнения.НаименованиеФоновогоЗадания = НСтр("ru = 'Получение и отправка электронной почты пользователя'");
	
	ДлительнаяОперация = ДлительныеОперации.ВыполнитьВФоне("УправлениеЭлектроннойПочтой.ОтправитьЗагрузитьПочтуПользователя",
		ПараметрыПроцедуры,	ПараметрыВыполнения);
	Возврат ДлительнаяОперация;
	
КонецФункции

////////////////////////////////////////////////////////////////////////////////
//  Прочее

// Устанавливает предмет для массива взаимодействий.
//
// Параметры:
//  МассивВзаимодействий - Массив - массив взаимодействий для которых будет установлен предмет.
//  Предмет  - Ссылка - предмет, на который будет выполнена замена.
//  ПроверятьНаличиеДругихЦепочек - Булево - если Истина, то будет выполнена замена предмета и для взаимодействий,
//                                           которые входят в  цепочки взаимодействий первым взаимодействием которых
//                                           является взаимодействие входящее в массив.
//
Процедура УстановитьПредметДляМассиваВзаимодействий(МассивВзаимодействий, Предмет, ПроверятьНаличиеДругихЦепочек = Ложь) Экспорт

	Если ПроверятьНаличиеДругихЦепочек Тогда
		
		Запрос = Новый Запрос;
		Запрос.Текст = "ВЫБРАТЬ РАЗЛИЧНЫЕ
		|	ПредметыВзаимодействий.Взаимодействие КАК Ссылка
		|ИЗ
		|	РегистрСведений.ПредметыПапкиВзаимодействий КАК ПредметыВзаимодействий
		|ГДЕ
		|	НЕ (НЕ ПредметыВзаимодействий.Предмет В (&МассивВзаимодействий)
		|			И НЕ ПредметыВзаимодействий.Взаимодействие В (&МассивВзаимодействий))";
		
		Запрос.УстановитьПараметр("МассивВзаимодействий", МассивВзаимодействий);
		МассивВзаимодействий = Запрос.Выполнить().Выгрузить().ВыгрузитьКолонку("Ссылка");
		
	КонецЕсли;
	
	НачатьТранзакцию();
	Попытка
		Блокировка = Новый БлокировкаДанных;
		РегистрыСведений.ПредметыПапкиВзаимодействий.ЗаблокироватьПредметыПапокВзаимодействий(Блокировка, МассивВзаимодействий);
		Блокировка.Заблокировать();
		
		Если ТипЗнч(Предмет) = Тип("РегистрСведенийКлючЗаписи.СостоянияПредметовВзаимодействий") Тогда
			Предмет = Предмет.Предмет;
		КонецЕсли;
		
		Запрос = Новый Запрос;
		Запрос.Текст = "ВЫБРАТЬ РАЗЛИЧНЫЕ
		|	ПредметыПапкиВзаимодействий.Предмет
		|ИЗ
		|	РегистрСведений.ПредметыПапкиВзаимодействий КАК ПредметыПапкиВзаимодействий
		|ГДЕ
		|	ПредметыПапкиВзаимодействий.Взаимодействие В(&МассивВзаимодействий)
		|
		|ОБЪЕДИНИТЬ ВСЕ
		|
		|ВЫБРАТЬ
		|	&Предмет";
		
		Запрос.УстановитьПараметр("Предмет", Предмет);
		Запрос.УстановитьПараметр("МассивВзаимодействий", МассивВзаимодействий);
		
		ВыборкаПредметы = Запрос.Выполнить().Выбрать();
		
		Для Каждого Взаимодействие Из МассивВзаимодействий Цикл
			Взаимодействия.УстановитьПредмет(Взаимодействие, Предмет, Ложь);
		КонецЦикла;
		
		Взаимодействия.РассчитатьРассмотреноПоПредметам(Взаимодействия.ТаблицаДанныхДляРасчетаРассмотрено(ВыборкаПредметы, "Предмет"));
		ЗафиксироватьТранзакцию();
	Исключение
		ОтменитьТранзакцию();
		ВызватьИсключение;
	КонецПопытки;	
КонецПроцедуры

// Преобразует письмо в двоичные данные и подготавливает к сохранению на диск.
//
// Параметры:
//  Письмо                  - ДокументСсылка.ЭлектронноеПисьмоВходящее,
//                            ДокументСсылка.ЭлектронноеПисьмоИсходящее - письмо, которое подготавливается к сохранению.
//  УникальныйИдентификатор - УникальныйИдентификатор - уникальный идентификатор формы, из которой была вызвана команда сохранения.
//
// Возвращаемое значение:
//  Структура - структура, содержащая подготовленные данные письма.
//
Функция ДанныеПисьмаДляСохраненияКакФайл(Письмо, УникальныйИдентификатор) Экспорт

	ДанныеФайла = СтруктураДанныхФайла();
	
	ДанныеПисьма = Взаимодействия.ИнтернетПочтовоеСообщениеИзПисьма(Письмо);
	Если ДанныеПисьма <> Неопределено Тогда
		
		ДвоичныеДанные = ДанныеПисьма.ИнтернетПочтовоеСообщение.ПолучитьИсходныеДанные();
		ДанныеФайла.СсылкаНаДвоичныеДанныеФайла = ПоместитьВоВременноеХранилище(ДвоичныеДанные, УникальныйИдентификатор);

		ДанныеФайла.Наименование = Взаимодействия.ПредставлениеПисьма(ДанныеПисьма.ИнтернетПочтовоеСообщение.Тема,
			ДанныеПисьма.ДатаПисьма);
		
		ДанныеФайла.Расширение  = "eml";
		ДанныеФайла.ИмяФайла    = ДанныеФайла.Наименование + "." + ДанныеФайла.Расширение;
		ДанныеФайла.Размер      = ДвоичныеДанные.Размер();
		ПапкаДляСохранитьКак = ОбщегоНазначения.ХранилищеОбщихНастроекЗагрузить("НастройкиПрограммы", "ПапкаДляСохранитьКак");
		ДанныеФайла.Вставить("ПапкаДляСохранитьКак", ПапкаДляСохранитьКак);
		ДанныеФайла.ДатаМодификацииУниверсальная = ТекущаяДатаСеанса();
		ДанныеФайла.ПолноеНаименованиеВерсии = ДанныеФайла.ИмяФайла;
		
	КонецЕсли;
	
	Возврат ДанныеФайла;

КонецФункции

Функция СтруктураДанныхФайла()

	СтруктураДанныхФайла = Новый Структура;
	СтруктураДанныхФайла.Вставить("СсылкаНаДвоичныеДанныеФайла",        "");
	СтруктураДанныхФайла.Вставить("ОтносительныйПуть",                  "");
	СтруктураДанныхФайла.Вставить("ДатаМодификацииУниверсальная",       Дата(1, 1, 1));
	СтруктураДанныхФайла.Вставить("ИмяФайла",                           "");
	СтруктураДанныхФайла.Вставить("Наименование",                       "");
	СтруктураДанныхФайла.Вставить("Расширение",                         "");
	СтруктураДанныхФайла.Вставить("Размер",                             "");
	СтруктураДанныхФайла.Вставить("Редактирует",                        Неопределено);
	СтруктураДанныхФайла.Вставить("ПодписанЭП",                         Ложь);
	СтруктураДанныхФайла.Вставить("Зашифрован",                         Ложь);
	СтруктураДанныхФайла.Вставить("ФайлРедактируется",                  Ложь);
	СтруктураДанныхФайла.Вставить("ФайлРедактируетТекущийПользователь", Ложь);
	СтруктураДанныхФайла.Вставить("ПолноеНаименованиеВерсии",           "");
	
	Возврат СтруктураДанныхФайла;

КонецФункции 

#КонецОбласти
`,
	cilkcpp: `// Cilk keywords
cilk_scope {}
cilk_spawn f();
cilk_spawn {}
cilk_sync;
cilk_for () {}
int cilk_reducer() x;

// Full example
#include <cilk/cilk.h>
#include <vector>

int fib_cilk_scope(int n) {
	if (n < 2)
		return;
	int x, y;
	cilk_scope {
		x = cilk_spawn fib(n-1);
		y = fib(n-2);
	}
	return x + y;

int fib_cilk_sync(int n) {
	if (n < 2)
		return;
	int x = cilk_spawn fib(n-1);
	int y = fib(n-2);
	cilk_sync;
	return x + y;
}

void zero(void *v) {
	*(int *)v = 0;
}
void plus(void *l, void *r) {
	*(int *)l += *(int *)r;
}
int array_sum_cilk_for_reducer(std::vector<int> A) {
	int cilk_reducer(zero, plus) sum = 0;
	cilk_for (auto itr = A.cbegin(); itr != A.cend(); ++itr)
		sum += *itr;
	return sum;
}
`,
	clike: `// Comments
// Single line comment
/* Multi-line
comment */

// Strings
"foo \\"bar\\" baz";
'foo \\'bar\\' baz';

// Numbers
123
123.456
-123.456
1e-23
123.456E789
0xaf
0xAF

// Functions
foo();
Bar();
_456();
`,
	cilkc: `// Cilk keywords
cilk_scope {}
cilk_spawn f();
cilk_spawn {}
cilk_sync;
cilk_for () {}
int cilk_reducer() x;

// Full example
#include <cilk/cilk.h>

int fib_cilk_scope(int n) {
	if (n < 2)
		return;
	int x, y;
	cilk_scope {
		x = cilk_spawn fib(n-1);
		y = fib(n-2);
	}
	return x + y;

int fib_cilk_sync(int n) {
	if (n < 2)
		return;
	int x = cilk_spawn fib(n-1);
	int y = fib(n-2);
	cilk_sync;
	return x + y;
}

void zero(void *v) {
	*(int *)v = 0;
}
void plus(void *l, void *r) {
	*(int *)l += *(int *)r;
}
int array_sum_cilk_for_reducer(int *A, int n) {
	int cilk_reducer(zero, plus) sum = 0;
	cilk_for (int i = 0; i < n; ++i)
		sum += A[i];
	return sum;
}
`,
	cmake: `# Comments
# This is a comment

# Keywords
add_library(foo main.cpp)
target_link_libraries(foo bar)

# Functions
user_defined_function()
another_custom_function(argument)

# Variables
CMAKE_COMPILER_IS_GNUG77
CMAKE_COMPILE_PDB_OUTPUT_DIRECTORY
CMAKE_COMPILE_PDB_OUTPUT_DIRECTORY_WHATEVER
CMAKE_CONFIGURATION_TYPES
CMAKE_CPACK_COMMAND
CMAKE_CROSSCOMPILING
CMAKE_CROSSCOMPILING_EMULATOR
CMAKE_CTEST_COMMAND
CMAKE_CUDA_EXTENSIONS
CMAKE_CUDA_HOST_COMPILER
CMAKE_CUDA_SEPARABLE_COMPILATION
CMAKE_CUDA_STANDARD
CMAKE_CUDA_STANDARD_REQUIRED
"\${INSIDE_STRING}"
"\${PROPER}chaining\${VARIABLES}"

# Properties
CUDA_STANDARD
CUDA_STANDARD_REQUIRED
CXX_EXTENSIONS
CXX_STANDARD
cxx_std_17
cxx_variadic_templates

# Strings
"A string"
	"A multi
	line
	string"
	"A \${VARIABLE} insde a string"

# Full example
cmake_minimum_required(VERSION 3.13)

project(crypto)

add_library(base INTERFACE)
target_compile_features(base INTERFACE
	cxx_std_17
	)

add_subdirectory(helpers)
add_subdirectory(msg)

add_library(analyzers-obj OBJECT
	CryptoAnalyzer.cpp
	)

target_include_directories(analyzers-obj
	PUBLIC
		\${CMAKE_CURRENT_SOURCE_DIR}
	)

find_package(predi REQUIRED)
target_link_libraries(analyzers-obj
	PUBLIC
		base
		predi::predi
		crypto::helpers
	)

set_target_properties(analyzers-obj
	PROPERTIES
		POSITION_INDEPENDENT_CODE ON
	)

add_library(analyzers SHARED
	$<TARGET_OBJECTS:analyzers-obj>
	)

target_link_libraries(analyzers PUBLIC analyzers-obj)

add_executable(crypto
	main.cpp
	)

target_link_libraries(crypto
	PUBLIC
		analyzers
	PRIVATE
		base
		messages
	)

enable_testing()
add_subdirectory(tests)
`,
	clojure: `; Full example
; This code is copied from https://learnxinyminutes.com/docs/clojure/

; Comments start with semicolons.

; Clojure is written in "forms", which are just
; lists of things inside parentheses, separated by whitespace.
;
; The clojure reader assumes that the first thing is a
; function or macro to call, and the rest are arguments.

; The first call in a file should be ns, to set the namespace
(ns learnclojure)

; More basic examples:

; str will create a string out of all its arguments
(str "Hello" " " "World") ; => "Hello World"

; Math is straightforward
(+ 1 1) ; => 2
(- 2 1) ; => 1
(* 1 2) ; => 2
(/ 2 1) ; => 2

; Equality is =
(= 1 1) ; => true
(= 2 1) ; => false

; You need not for logic, too
(not true) ; => false

; Nesting forms works as you expect
(+ 1 (- 3 2)) ; = 1 + (3 - 2) => 2

; Types
;;;;;;;;;;;;;

; Clojure uses Java's object types for booleans, strings and numbers.
; Use \`class\` to inspect them.
(class 1) ; Integer literals are java.lang.Long by default
(class 1.); Float literals are java.lang.Double
(class ""); Strings always double-quoted, and are java.lang.String
(class false) ; Booleans are java.lang.Boolean
(class nil); The "null" value is called nil

; If you want to create a literal list of data, use ' to stop it from
; being evaluated
'(+ 1 2) ; => (+ 1 2)
; (shorthand for (quote (+ 1 2)))

; You can eval a quoted list
(eval '(+ 1 2)) ; => 3

; Collections & Sequences
;;;;;;;;;;;;;;;;;;;

; Lists are linked-list data structures, while Vectors are array-backed.
; Vectors and Lists are java classes too!
(class [1 2 3]); => clojure.lang.PersistentVector
(class '(1 2 3)); => clojure.lang.PersistentList

; A list would be written as just (1 2 3), but we have to quote
; it to stop the reader thinking it's a function.
; Also, (list 1 2 3) is the same as '(1 2 3)

; "Collections" are just groups of data
; Both lists and vectors are collections:
(coll? '(1 2 3)) ; => true
(coll? [1 2 3]) ; => true

; "Sequences" (seqs) are abstract descriptions of lists of data.
; Only lists are seqs.
(seq? '(1 2 3)) ; => true
(seq? [1 2 3]) ; => false

; A seq need only provide an entry when it is accessed.
; So, seqs which can be lazy -- they can define infinite series:
(range 4) ; => (0 1 2 3)
(range) ; => (0 1 2 3 4 ...) (an infinite series)
(take 4 (range)) ;  (0 1 2 3)

; Use cons to add an item to the beginning of a list or vector
(cons 4 [1 2 3]) ; => (4 1 2 3)
(cons 4 '(1 2 3)) ; => (4 1 2 3)

; Conj will add an item to a collection in the most efficient way.
; For lists, they insert at the beginning. For vectors, they insert at the end.
(conj [1 2 3] 4) ; => [1 2 3 4]
(conj '(1 2 3) 4) ; => (4 1 2 3)

; Use concat to add lists or vectors together
(concat [1 2] '(3 4)) ; => (1 2 3 4)

; Use filter, map to interact with collections
(map inc [1 2 3]) ; => (2 3 4)
(filter even? [1 2 3]) ; => (2)

; Use reduce to reduce them
(reduce + [1 2 3 4])
; = (+ (+ (+ 1 2) 3) 4)
; => 10

; Reduce can take an initial-value argument too
(reduce conj [] '(3 2 1))
; = (conj (conj (conj [] 3) 2) 1)
; => [3 2 1]

; Functions
;;;;;;;;;;;;;;;;;;;;;

; Use fn to create new functions. A function always returns
; its last statement.
(fn [] "Hello World") ; => fn

; (You need extra parens to call it)
((fn [] "Hello World")) ; => "Hello World"

; You can create a var using def
(def x 1)
x ; => 1

; Assign a function to a var
(def hello-world (fn [] "Hello World"))
(hello-world) ; => "Hello World"

; You can shorten this process by using defn
(defn hello-world [] "Hello World")

; The [] is the list of arguments for the function.
(defn hello [name]
	(str "Hello " name))
(hello "Steve") ; => "Hello Steve"

; You can also use this shorthand to create functions:
(def hello2 #(str "Hello " %1))
(hello2 "Fanny") ; => "Hello Fanny"

; You can have multi-variadic functions, too
(defn hello3
	([] "Hello World")
	([name] (str "Hello " name)))
(hello3 "Jake") ; => "Hello Jake"
(hello3) ; => "Hello World"

; Functions can pack extra arguments up in a seq for you
(defn count-args [& args]
	(str "You passed " (count args) " args: " args))
(count-args 1 2 3) ; => "You passed 3 args: (1 2 3)"

; You can mix regular and packed arguments
(defn hello-count [name & args]
	(str "Hello " name ", you passed " (count args) " extra args"))
(hello-count "Finn" 1 2 3)
; => "Hello Finn, you passed 3 extra args"


; Maps
;;;;;;;;;;

; Hash maps and array maps share an interface. Hash maps have faster lookups
; but don't retain key order.
(class {:a 1 :b 2 :c 3}) ; => clojure.lang.PersistentArrayMap
(class (hash-map :a 1 :b 2 :c 3)) ; => clojure.lang.PersistentHashMap

; Arraymaps will automatically become hashmaps through most operations
; if they get big enough, so you don't need to worry.

; Maps can use any hashable type as a key, but usually keywords are best
; Keywords are like strings with some efficiency bonuses
(class :a) ; => clojure.lang.Keyword

(def stringmap {"a" 1, "b" 2, "c" 3})
stringmap  ; => {"a" 1, "b" 2, "c" 3}

(def keymap {:a 1, :b 2, :c 3})
keymap ; => {:a 1, :c 3, :b 2}

; By the way, commas are always treated as whitespace and do nothing.

; Retrieve a value from a map by calling it as a function
(stringmap "a") ; => 1
(keymap :a) ; => 1

; Keywords can be used to retrieve their value from a map, too!
(:b keymap) ; => 2

; Don't try this with strings.
;("a" stringmap)
; => Exception: java.lang.String cannot be cast to clojure.lang.IFn

; Retrieving a non-present key returns nil
(stringmap "d") ; => nil

; Use assoc to add new keys to hash-maps
(def newkeymap (assoc keymap :d 4))
newkeymap ; => {:a 1, :b 2, :c 3, :d 4}

; But remember, clojure types are immutable!
keymap ; => {:a 1, :b 2, :c 3}

; Use dissoc to remove keys
(dissoc keymap :a :b) ; => {:c 3}

; Sets
;;;;;;

(class #{1 2 3}) ; => clojure.lang.PersistentHashSet
(set [1 2 3 1 2 3 3 2 1 3 2 1]) ; => #{1 2 3}

; Add a member with conj
(conj #{1 2 3} 4) ; => #{1 2 3 4}

; Remove one with disj
(disj #{1 2 3} 1) ; => #{2 3}

; Test for existence by using the set as a function:
(#{1 2 3} 1) ; => 1
(#{1 2 3} 4) ; => nil

; There are more functions in the clojure.sets namespace.

; Useful forms
;;;;;;;;;;;;;;;;;

; Logic constructs in clojure are just macros, and look like
; everything else
(if false "a" "b") ; => "b"
(if false "a") ; => nil

; Use let to create temporary bindings
(let [a 1 b 2]
	(> a b)) ; => false

; Group statements together with do
(do
	(print "Hello")
	"World") ; => "World" (prints "Hello")

; Functions have an implicit do
(defn print-and-say-hello [name]
	(print "Saying hello to " name)
	(str "Hello " name))
(print-and-say-hello "Jeff") ;=> "Hello Jeff" (prints "Saying hello to Jeff")

; So does let
(let [name "Urkel"]
	(print "Saying hello to " name)
	(str "Hello " name)) ; => "Hello Urkel" (prints "Saying hello to Urkel")


; Use the threading macros (-> and ->>) to express transformations of
; data more clearly.

; The "Thread-first" macro (->) inserts into each form the result of
; the previous, as the first argument (second item)
(->
	 {:a 1 :b 2}
	 (assoc :c 3) ;=> (assoc {:a 1 :b 2} :c 3)
	 (dissoc :b)) ;=> (dissoc (assoc {:a 1 :b 2} :c 3) :b)

; This expression could be written as:
; (dissoc (assoc {:a 1 :b 2} :c 3) :b)
; and evaluates to {:a 1 :c 3}

; The double arrow does the same thing, but inserts the result of
; each line at the *end* of the form. This is useful for collection
; operations in particular:
(->>
	 (range 10)
	 (map inc)     ;=> (map inc (range 10)
	 (filter odd?) ;=> (filter odd? (map inc (range 10))
	 (into []))    ;=> (into [] (filter odd? (map inc (range 10)))
								 ; Result: [1 3 5 7 9]

; When you are in a situation where you want more freedom as where to
; put the result of previous data transformations in an
; expression, you can use the as-> macro. With it, you can assign a
; specific name to transformations' output and use it as a
; placeholder in your chained expressions:

(as-> [1 2 3] input
	(map inc input);=> You can use last transform's output at the last position
	(nth input 2) ;=>  and at the second position, in the same expression
	(conj [4 5 6] input [8 9 10])) ;=> or in the middle !



; Modules
;;;;;;;;;;;;;;;

; Use "use" to get all functions from the module
(use 'clojure.set)

; Now we can use set operations
(intersection #{1 2 3} #{2 3 4}) ; => #{2 3}
(difference #{1 2 3} #{2 3 4}) ; => #{1}

; You can choose a subset of functions to import, too
(use '[clojure.set :only [intersection]])

; Use require to import a module
(require 'clojure.string)

; Use / to call functions from a module
; Here, the module is clojure.string and the function is blank?
(clojure.string/blank? "") ; => true

; You can give a module a shorter name on import
(require '[clojure.string :as str])
(str/replace "This is a test." #"[a-o]" str/upper-case) ; => "THIs Is A tEst."
; (#"" denotes a regular expression literal)

; You can use require (and use, but don't) from a namespace using :require.
; You don't need to quote your modules if you do it this way.
(ns test
	(:require
		[clojure.string :as str]
		[clojure.set :as set]))

; Java
;;;;;;;;;;;;;;;;;

; Java has a huge and useful standard library, so
; you'll want to learn how to get at it.

; Use import to load a java module
(import java.util.Date)

; You can import from an ns too.
(ns test
	(:import java.util.Date
					 java.util.Calendar))

; Use the class name with a "." at the end to make a new instance
(Date.) ; <a date object>

; Use . to call methods. Or, use the ".method" shortcut
(. (Date.) getTime) ; <a timestamp>
(.getTime (Date.)) ; exactly the same thing.

; Use / to call static methods
(System/currentTimeMillis) ; <a timestamp> (system is always present)

; Use doto to make dealing with (mutable) classes more tolerable
(import java.util.Calendar)
(doto (Calendar/getInstance)
	(.set 2000 1 1 0 0 0)
	.getTime) ; => A Date. set to 2000-01-01 00:00:00

; STM
;;;;;;;;;;;;;;;;;

; Software Transactional Memory is the mechanism clojure uses to handle
; persistent state. There are a few constructs in clojure that use this.

; An atom is the simplest. Pass it an initial value
(def my-atom (atom {}))

; Update an atom with swap!.
; swap! takes a function and calls it with the current value of the atom
; as the first argument, and any trailing arguments as the second
(swap! my-atom assoc :a 1) ; Sets my-atom to the result of (assoc {} :a 1)
(swap! my-atom assoc :b 2) ; Sets my-atom to the result of (assoc {:a 1} :b 2)

; Use '@' to dereference the atom and get the value
my-atom  ;=> Atom<#...> (Returns the Atom object)
@my-atom ; => {:a 1 :b 2}

; Here's a simple counter using an atom
(def counter (atom 0))
(defn inc-counter []
	(swap! counter inc))

(inc-counter)
(inc-counter)
(inc-counter)
(inc-counter)
(inc-counter)

@counter ; => 5

; Other STM constructs are refs and agents.
; Refs: http://clojure.org/refs
; Agents: http://clojure.org/agents
`,
	cobol: `* Full example
*> https://en.wikipedia.org/w/index.php?title=COBOL&oldid=1011483106
RD  sales-report
		PAGE LIMITS 60 LINES
		FIRST DETAIL 3
		CONTROLS seller-name.

01  TYPE PAGE HEADING.
		03  COL 1                    VALUE "Sales Report".
		03  COL 74                   VALUE "Page".
		03  COL 79                   PIC Z9 SOURCE PAGE-COUNTER.

01  sales-on-day TYPE DETAIL, LINE + 1.
		03  COL 3                    VALUE "Sales on".
		03  COL 12                   PIC 99/99/9999 SOURCE sales-date.
		03  COL 21                   VALUE "were".
		03  COL 26                   PIC $$$$9.99 SOURCE sales-amount.

01  invalid-sales TYPE DETAIL, LINE + 1.
		03  COL 3                    VALUE "INVALID RECORD:".
		03  COL 19                   PIC X(34) SOURCE sales-record.

01  TYPE CONTROL HEADING seller-name, LINE + 2.
		03  COL 1                    VALUE "Seller:".
		03  COL 9                    PIC X(30) SOURCE seller-name.
`,
	coffeescript: `# Comments
# This is a comment
### This is a
multi-line comment###

# Strings
'foo \\'bar\\' baz'
"foo \\"bar\\" baz"
'Multi-line
strings are supported'
"Multi-line
strings are supported"
''' 'Block strings'
are supported too'''
""" "Block strings"
are supported too"""

# String interpolation
"String #{interpolation} is supported"
'This works #{only} between double-quoted strings'

# Object properties
kids =
	brother:
		name: "Max"
		age:  11
	sister:
		name: "Ida"
		age:  9

# Regexps
/normal [r]egexp?/;
/// ^(
	mul\\t[i-l]ine
	regexp          # with embedded comment
) ///

# Classes
class Animal
	constructor: (@name) ->
	move: (meters) ->
		alert @name + " moved #{meters}m."

class Snake extends Animal
	move: ->
		alert "Slithering..."
		super 5

class Horse extends Animal
	move: ->
		alert "Galloping..."
		super 45

sam = new Snake "Sammy the Python"
tom = new Horse "Tommy the Palomino"

sam.move()
tom.move()

# Inline JavaScript
\`alert("foo")\`
`,
	concurnas: `// Comments
// This is a comment
/* This is a comment
on multiple lines */

// Numbers
12
12e5
12.f
12f
12d
12.d
12.0
12.0f
12.0d

// strings and language extensions
"hi"
'hi'
'c'
'what "yach"'
s'c'
"c"
r"[a-z|A-Z]+"

// Functions
def add(a int, b int) => a + b

// Language Extensions
dcalc = mylisp||(+ 1 2 (* 2 3))|| // == 9

myFortran || program hello
					print *, "Hello World!"
			 		end program hello || //prints "Hello World!"

lotto = myAPL || x[⍋x←6?40] || //6 unique random numbers from 1 to 40

// Full example
//an overloaded function
def adder(a int, b int) => a + b
def adder(a int, b float) => adder(a, b as int)
def adder(a int) => adder(a, 10)

//a default value
def powerPlus(a int, raiseTo = 2, c int) => a ** raiseTo + c

//call our function with a default value
res1 = powerPlus(4, 10)//second argument defaults to '2'
res2 = powerPlus(4, 3, 10)//second argument provided

//calling a function with named parameters:
def powerAdder(a int, raiseATo = 2, b int, raiseBTo = 2) => a**raiseATo + b**raiseBTo
res3 = powerAdder(2, 4, raiseATo=3)//equivalent to: powerAdder(2, 3, 4, 2)

//varargs:
def sum(elms int...) int {
	res = 0
	for(elm in elms){
		res += elm
	}
	res
}

//call our function with a vararg
thesum = sum(1, 2, 3, 4, 5)

//partially defined typedef
typedef NameMap<X> = java.util.ArrayList<java.util.HashMap<String, java.util.HashSet<X>>>

//using typedefs...
nm NameMap<String>= new NameMap<String>()

@Annotation
class MyClass(a int, b int, c String){
	override toString() => 'MyClass({a}, {b}, "{c}")'
}

mc1 = MyClass(12, 14, "hi there")
mc2 = mc1@ //copy mc1

assert mc1 == mc2//same values!
assert mc1 &<> mc2//different objects!

mc3 = mc1@(a = 100)//copy mc1 but overwrite value of a
assert 'MyClass(100, 14, "hi there")' == mc3.toString()

mc4 = mc1@(<a, b>)//copy mc1 but exclude a and b
assert 'MyClass(0, 0, "hi there")' == mc3.toString()
`,
	cooklang: `-- Comments
-- This is a single line comment
[- this
is
a multi line comment -]

-- Meta
>> servings: 3
>> source: https://cooklang.org/docs/spec
>> any key: any value

-- Ingredients
@salt without amount
@egg{1}
@milk{1%l}
@milk{1|2%l}
@egg{1|2}
@egg{1*}
@milk{2*%l}

-- Cookware
#spoon without amount
#spoon{10%pair}
#spoon{1|2}
#spoon{1*%pair}
#spoon{1|2%pair}
#spoon{1*}

-- Timer
~{25%minutes} without name
~named timer{1%hours}
`,
	coq: `(* Full example *)
(* Source: https://coq.inria.fr/a-short-introduction-to-coq *)

Inductive seq : nat -> Set :=
| niln : seq 0
| consn : forall n : nat, nat -> seq n -> seq (S n).

Fixpoint length (n : nat) (s : seq n) {struct s} : nat :=
	match s with
	| niln => 0
	| consn i _ s' => S (length i s')
	end.

Theorem length_corr : forall (n : nat) (s : seq n), length n s = n.
Proof.
	intros n s.

	(* reasoning by induction over s. Then, we have two new goals
		corresponding on the case analysis about s (either it is
		niln or some consn *)
	induction s.

		(* We are in the case where s is void. We can reduce the
			term: length 0 niln *)
		simpl.

		(* We obtain the goal 0 = 0. *)
		trivial.

		(* now, we treat the case s = consn n e s with induction
			hypothesis IHs *)
		simpl.

		(* The induction hypothesis has type length n s = n.
			So we can use it to perform some rewriting in the goal: *)
		rewrite IHs.

		(* Now the goal is the trivial equality: S n = S n *)
		trivial.

	(* Now all sub cases are closed, we perform the ultimate
		step: typing the term built using tactics and save it as
		a witness of the theorem. *)
Qed.
`,
	cpp: `// Strings
"foo \\"bar\\" baz"
'foo \\'bar\\' baz'
"Multi-line strings ending with a \\
are supported too."

// Macro statements
# include <stdio.h>
#define PG_locked   0
#define PG_error    1

// Booleans
true;
false;

// Operators
a and b;
c bitand d;

// Full example
/*
David Cary 2010-09-14
quick demo for wikibooks
public domain
*/
#include <iostream>
#include <vector>
using namespace std;

vector<int> pick_vector_with_biggest_fifth_element(
	vector<int> left,
	vector<int> right
){
	if( (left[5]) < (right[5]) ){
		return( right );
	};
	// else
	return( left );
}

int vector_demo(void){
	cout << "vector demo" << endl;
	vector<int> left(7);
	vector<int> right(7);

	left[5] = 7;
	right[5] = 8;
	cout << left[5] << endl;
	cout << right[5] << endl;
	vector<int> biggest(
		pick_vector_with_biggest_fifth_element( left, right )
	);
	cout << biggest[5] << endl;

	return 0;
}

int main(void){
	vector_demo();
}

// OpenCL host code
// OpenCL functions, constants, etc. are also highlighted in OpenCL host code in the c or cpp language
cl::Event KernelFilterImages::runSingle(const cl::Image2D& imgSrc, SPImage2D& imgDst)
{
	const size_t rows = imgSrc.getImageInfo<CL_IMAGE_HEIGHT>();
	const size_t cols = imgSrc.getImageInfo<CL_IMAGE_WIDTH>();

	ASSERT(rows > 0 && cols > 0, "The image object seems to be invalid, no rows/cols set");
	ASSERT(imgSrc.getImageInfo<CL_IMAGE_FORMAT>().image_channel_data_type == CL_FLOAT, "Only float type images are supported");
	ASSERT(imgSrc.getInfo<CL_MEM_FLAGS>() == CL_MEM_READ_ONLY || imgSrc.getInfo<CL_MEM_FLAGS>() == CL_MEM_READ_WRITE, "Can't read the input image");

	imgDst = std::make_shared<cl::Image2D>(*context, CL_MEM_READ_WRITE, cl::ImageFormat(CL_R, CL_FLOAT), cols, rows);

	cl::Kernel kernel(*program, "filter_single");
	kernel.setArg(0, imgSrc);
	kernel.setArg(1, *imgDst);
	kernel.setArg(2, bufferKernel1);
	kernel.setArg(3, kernel1.rows);
	kernel.setArg(4, kernel1.rows / 2);
	kernel.setArg(5, kernel1.cols);
	kernel.setArg(6, kernel1.cols / 2);
	kernel.setArg(7, border);

	cl::Event eventFilter;
	const cl::NDRange global(cols, rows);
	queue->enqueueNDRangeKernel(kernel, cl::NullRange, global, cl::NullRange, &events, &eventFilter);
}
`,
	crystal: `# Number literals with underscores and postfix
1_u32
123_456.789e-10_f64

# Attributes
@[AlwaysInline]
def foo
	1
end

# Macro expansions
{% for key, value in {foo: 100, bar: 20} %}
	def {{ key.id }}
		{{ value }}
	end
{% end %}
`,
	csharp: `// Comments
// Single line comment
/* Multi-line
comment */

// Strings
"foo \\"bar\\" baz"
@"Verbatim strings"
@"Luis: ""Patrick, where did you get that overnight bag?""
		Patrick: ""Jean Paul Gaultier.""";

// Full example
using System.Windows.Forms;
using System.Drawing;

public static DialogResult InputBox(string title, string promptText, ref string value)
{
	Form form = new Form();
	Label label = new Label();
	TextBox textBox = new TextBox();
	Button buttonOk = new Button();
	Button buttonCancel = new Button();

	form.Text = title;
	label.Text = promptText;
	textBox.Text = value;

	buttonOk.Text = "OK";
	buttonCancel.Text = "Cancel";
	buttonOk.DialogResult = DialogResult.OK;
	buttonCancel.DialogResult = DialogResult.Cancel;

	label.SetBounds(9, 20, 372, 13);
	textBox.SetBounds(12, 36, 372, 20);
	buttonOk.SetBounds(228, 72, 75, 23);
	buttonCancel.SetBounds(309, 72, 75, 23);

	label.AutoSize = true;
	textBox.Anchor = textBox.Anchor | AnchorStyles.Right;
	buttonOk.Anchor = AnchorStyles.Bottom | AnchorStyles.Right;
	buttonCancel.Anchor = AnchorStyles.Bottom | AnchorStyles.Right;

	form.ClientSize = new Size(396, 107);
	form.Controls.AddRange(new Control[] { label, textBox, buttonOk, buttonCancel });
	form.ClientSize = new Size(Math.Max(300, label.Right + 10), form.ClientSize.Height);
	form.FormBorderStyle = FormBorderStyle.FixedDialog;
	form.StartPosition = FormStartPosition.CenterScreen;
	form.MinimizeBox = false;
	form.MaximizeBox = false;
	form.AcceptButton = buttonOk;
	form.CancelButton = buttonCancel;

	DialogResult dialogResult = form.ShowDialog();
	value = textBox.Text;
	return dialogResult;
}

// XMLDoc
/// <summary>
/// Summary documentation goes here.
/// </summary>
`,
	cshtml: `@* Full example *@
@* Source: https://docs.microsoft.com/en-us/aspnet/core/razor-pages/?view=aspnetcore-5.0&tabs=visual-studio#the-home-page *@

@page
@model RazorPagesContacts.Pages.Customers.IndexModel
@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers

<h1>Contacts home page</h1>
<form method="post">
	<table class="table">
		<thead>
			<tr>
				<th>ID</th>
				<th>Name</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			@foreach (var contact in Model.Customer)
			{
				<tr>
					<td> @contact.Id  </td>
					<td>@contact.Name</td>
					<td>
						<a asp-page="./Edit" asp-route-id="@contact.Id">Edit</a> |
						<button type="submit" asp-page-handler="delete"
								asp-route-id="@contact.Id">delete
						</button>
					</td>
				</tr>
			}
		</tbody>
	</table>
	<a asp-page="Create">Create New</a>
</form>
`,
	csp: `A complete policy
default-src 'none';
script-src my.cdn.com;
img-src 'self' data:;
child-src 'self' data: ms-appx-web:;
block-all-mixed-content;
report-uri https://my-reports.com/submit;

An policy with unsafe source expressions
script-src 'self' 'unsafe-eval' 'unsafe-inline';
style-src 'unsafe-inline' 'unsafe-hashed-attributes' 'self';
`,
	css: `/* Empty rule */
*{} * {} p {}
ul,
ol {}

/* Simple rule */
p { color: red; }

/* Important rule */
p {
	color: red !important;
	line-height: normal!important;
}
p{position:absolute!important}

/* @ rule */
@media screen and (min-width: 100px) {}

/* LESS variable */
@main-color: red;
.foo {
	background: @main-color;
}

/* Comment */
/* Simple comment here */

/* String */
content: 'foo';

/* URL */
content: url(foo.png);

/* Selectors */
a#id.class:hover {}
li:nth-child(2n+1) {}
span::before {}
a[title], a[href$=".pdf"] {}, a[href$=".jpg" i] {}

/* Variables */
:root {
	--foo: 12px;
}
a {
	font-size: var(--foo);
	padding: calc(var(--foo) + .5em);
}

/* Colors */
span {
	background: rgba(0, 128, 255, .4);
	color: red;
	color: green;
	color: blue;
	border: 1px solid #FFF;
}
`,
	csv: `Full example
Year,Make,Model,Description,Price
1997,Ford,E350,"ac, abs, moon",3000.00
1999,Chevy,"Venture ""Extended Edition""","",4900.00
1999,Chevy,"Venture ""Extended Edition, Very Large""",,5000.00
1996,Jeep,Grand Cherokee,"MUST SELL!
air, moon roof, loaded",4799.00
`,
	cue: `// Full example
#Spec: {
	kind: string

	name: {
		first:   !=""  // must be specified and non-empty
		middle?: !=""  // optional, but must be non-empty when specified
		last:    !=""
	}

	// The minimum must be strictly smaller than the maximum and vice versa.
	minimum?: int & <maximum
	maximum?: int & >minimum
}

// A spec is of type #Spec
spec: #Spec
spec: {
	knid: "Homo Sapiens" // error, misspelled field

	name: first: "Jane"
	name: last:  "Doe"
}
`,
	cypher: `// Full example
MATCH (person:Person)-[:WORKS_FOR]->(company)
WHERE company.name STARTS WITH "Company"
AND EXISTS {
	MATCH (person)-[:LIKES]->(t:Technology)
	WHERE size((t)<-[:LIKES]-()) >= 3
}
RETURN person.name as person, company.name AS company;
`,
	d: `// Comments
// Single line comment
/* Multi-line
	comment */
/+ Mutli-line
	/+ nestable +/
	comment +/

// Numbers
0 .. 2_147_483_647
2_147_483_648 .. 9_223_372_036_854_775_807
0L .. 9_223_372_036_854_775_807L
0U .. 4_294_967_296U
4_294_967_296U .. 18_446_744_073_709_551_615U
0UL .. 18_446_744_073_709_551_615UL
0x0 .. 0x7FFF_FFFF
0x8000_0000 .. 0xFFFF_FFFF
0x1_0000_0000 .. 0x7FFF_FFFF_FFFF_FFFF
0x8000_0000_0000_0000 .. 0xFFFF_FFFF_FFFF_FFFF
0x0L .. 0x7FFF_FFFF_FFFF_FFFFL
0x8000_0000_0000_0000L .. 0xFFFF_FFFF_FFFF_FFFFL
0x0U .. 0xFFFF_FFFFU
0x1_0000_0000U .. 0xFFFF_FFFF_FFFF_FFFFU
0x0UL .. 0xFFFF_FFFF_FFFF_FFFFUL

123_456.567_8          // 123456.5678
1_2_3_4_5_6_.5_6_7_8   // 123456.5678
1_2_3_4_5_6_.5e-6_     // 123456.5e-6
0x1.FFFFFFFFFFFFFp1023 // double.max
0x1p-52                // double.epsilon
1.175494351e-38F       // float.min
6.3i                   // idouble 6.3
6.3fi                  // ifloat 6.3
6.3Li                  // ireal 6.3
4.5 + 6.2i             // complex number (phased out)

// Strings
// WYSIWYG strings
r"hello"
r"c:\\root\\foo.exe"
r"ab\\n"
\`hello\`
\`c:\\root\\foo.exe\`
\`ab\\n\`

// Double-quoted strings
"hello"
"c:\\\\root\\\\foo.exe"
"ab\\n"
"ab
"

// Hex strings
x"0A"
x"00 FBCD 32FD 0A"

// String postfix characters
"hello"c  // string
"hello"w  // wstring
"hello"d  // dstring

// Delimited strings
q"(foo(xxx))"
q"[foo{]"
q"EOS
This
is a multi-line
heredoc string
EOS"
q"/foo]/"

// Token strings
q{foo}
q{/*}*/ }
q{ foo(q{hello}); }
q{ __TIME__ }

// Character literals
'a'
'\\u000A'

// Iasm registers
AL AH AX EAX
BL BH BX EBX
CL CH CX ECX
DL DH DX EDX
BP EBP
SP ESP
DI EDI
SI ESI
ES CS SS DS GS FS
CR0 CR2 CR3 CR4
DR0 DR1 DR2 DR3 DR6 DR7
TR3 TR4 TR5 TR6 TR7
ST
ST(0) ST(1) ST(2) ST(3) ST(4) ST(5) ST(6) ST(7)
MM0  MM1  MM2  MM3  MM4  MM5  MM6  MM7
XMM0 XMM1 XMM2 XMM3 XMM4 XMM5 XMM6 XMM7

RAX  RBX  RCX  RDX
BPL  RBP
SPL  RSP
DIL  RDI
SIL  RSI
R8B  R8W  R8D  R8
R9B  R9W  R9D  R9
R10B R10W R10D R10
R11B R11W R11D R11
R12B R12W R12D R12
R13B R13W R13D R13
R14B R14W R14D R14
R15B R15W R15D R15
XMM8 XMM9 XMM10 XMM11 XMM12 XMM13 XMM14 XMM15
YMM0 YMM1 YMM2  YMM3  YMM4  YMM5  YMM6  YMM7
YMM8 YMM9 YMM10 YMM11 YMM12 YMM13 YMM14 YMM15

// Full example
#!/usr/bin/dmd -run
/* sh style script syntax is supported! */
/* Hello World in D
	To compile:
	dmd hello.d
	or to optimize:
	dmd -O -inline -release hello.d
	or to get generated documentation:
	dmd hello.d -D
*/
import std.stdio;  // References to  commonly used I/O routines.
void main(char[][] args)   // 'void' here means return 0 by default.
{
	// Write-Formatted-Line
	writefln("Hello World, "  // automatic concatenation of string literals
					 "Reloaded");
	// Strings are denoted as a dynamic array of chars 'char[]'
	// auto type inference and built-in foreach
	foreach(argc, argv; args)
	{
		// OOP is supported, of course! And automatic type inference.
		auto cl = new CmdLin(argc, argv);

		// 'writefln' is the improved 'printf' !!
		// user-defined class properties.
		writefln(cl.argnum, cl.suffix, " arg: %s", cl.argv);
		// Garbage Collection or explicit memory management - your choice!!!
		delete cl;
	}
	// Nested structs, classes and functions!
	struct specs
	{
		// all vars. automatically initialized
		int count, allocated;
	}

	// Note that declarations read right-to-left.
	// So that 'char[][]' reads as an array of an array of chars.

	specs argspecs(char[][] args)
	// Optional (built-in) function contracts.
	in {
		assert (args.length > 0); // assert built in
	}
	out(result) {
		assert(result.count == CmdLin.total);
		assert(result.allocated > 0);
	}
	body {
		specs* s = new specs;
		// no need for '->'
		s.count = args.length;  // The 'length' property is number of elements.
		s.allocated = typeof(args).sizeof; // built-in properties for native types
		foreach(argv; args)
		s.allocated += argv.length * typeof(argv[0]).sizeof;
		return *s;
	}

	// built-in string and common string operations, e.g. '~' is concatenate.
	char[] argcmsg  = "argc = %d";
	char[] allocmsg = "allocated = %d";
	writefln(argcmsg ~ ", " ~ allocmsg,
	argspecs(args).count,argspecs(args).allocated);
}
/**
 Stores a single command line argument.
 */
 class CmdLin
{
	private {
		int _argc;
		char[] _argv;
		static uint _totalc;
	}

	public:
	/************
	Object constructor.
	params:
		argc = ordinal count of this argument.
		argv = text of the parameter
	*********/
	this(int argc, char[] argv)
	{
		_argc = argc + 1;
		_argv = argv;
		_totalc++;
	}

	~this() /// Object destructor
	{
		// Doesn't actually do anything for this example.
	}

	int argnum() /// A property that returns arg number
	{
		return _argc;
	}
	char[] argv() /// A property  that returns arg text
	{
		return _argv;
	}
	wchar[] suffix() /// A property  that returns ordinal suffix
	{
		wchar[] suffix;  // Built in  Unicode strings (utf8,utf16, utf32)
		switch(_argc)
		{
		case 1:
			suffix = "st";
			break;
		case 2:
			suffix = "nd";
			break;
		case 3:
			suffix = "rd";
			break;
		default: // 'default' is mandatory with "-w" compile switch.
			suffix = "th";
		}
		return suffix;
	}

	/* **************
	 * A property of the whole class, not just an instance.
	 * returns: The total number of commandline args added.
	 *************/
	static typeof(_totalc) total()
	{
		return _totalc;
	}
	// Class invariant, things that must be true after any method is run.
	invariant
	{
		assert(_argc > 0);
		assert(_totalc >= _argc);
	}
}
`,
	dart: `// Comments
// Single line comment
/// Documentation single line comment
/* Block comment
on several lines */
/** Multi-line
doc comment */

// Annotations
@todo('seth', 'make this do something')
@deprecated // Metadata; makes Dart Editor warn about using activate().

// Numbers
var x = 1;
var hex = 0xDEADBEEF;
var bigInt = 346534658346524376592384765923749587398457294759347029438709349347;
var y = 1.1;
var exponents = 1.42e5;

// Strings
var s1 = 'Single quotes work well for string literals.';
var s2 = "Double quotes work just as well.";
var s3 = 'It\\'s easy to escape the string delimiter.';
var s4 = "It's even easier to just use the other string delimiter.";
var s1 = '''
You can create
multi-line strings like this one.
''';
var s2 = """This is also a
multi-line string.""";
var s = r"In a raw string, even \\n isn't special.";

// Full example
class Logger {
	final String name;
	bool mute = false;

	// _cache is library-private, thanks to the _ in front of its name.
	static final Map<String, Logger> _cache = <String, Logger>{};

	factory Logger(String name) {
		if (_cache.containsKey(name)) {
			return _cache[name];
		} else {
			final logger = new Logger._internal(name);
			_cache[name] = logger;
			return logger;
		}
	}

	Logger._internal(this.name);

	void log(String msg) {
		if (!mute) {
			print(msg);
		}
	}
}
`,
	dataweave: `// Full example
%dw 2.0
input payalod application/json
ns ns0 http://localhost.com
var a = 123
type T = String
fun test(a: Number) = a + 123
output application/json
---
{
	// This is a comment
	/**
	This is a multiline comment
	**/
	name: payload.name,
	string: "this",
	'another string': true,
	"regex": /123/,
	fc: test(1),
	"dates": |12-12-2020-T12:00:00|,
	number: 123,
	"null": null,

	a: {} match {
		case  is {} -> foo.name
	},
	b: {} update {
	case name at .user.name ->  "123"
	},
	stringMultiLine: "This is a multiline
		string
	",
	a: if( !true > 2) a else 2,
	b: do {
		{}
	}
}
`,
	dax: `// Comments
// This is a comment

// Simple example
Sales YTD := 
CALCULATE (
	[Sales Amount], 
	DATESYTD( 'Date'[Date] )
)

// Full example
Burn Rate (Hours) = 

// Only consider those projects which have been alread created
VAR filterDate = 
	FILTER (
		ALL ( 'Date'[Date] ),
		'Date'[Date] <= MAX('Date'[Date])
	)

RETURN
IF (
	// Show blank for months before project start
	MAX ( 'Project'[Project Created Relative Months Pos] ) < SELECTEDVALUE ( 'Date'[Fiscal RelativeMonthPos] ),
	BLANK (),
	MIN(
		1,
		DIVIDE (
			// Add 0 to consider months with no hours
			[Hours Actual Billable] + 0,
			CALCULATE (
				[Planned Hours] + 0,
				filterDate
			)
		)
	)
)
`,
	dhall: `-- Full example
-- source: https://github.com/dhall-lang/dhall-lang/blob/master/Prelude/Optional/head.dhall

{-
Returns the first non-empty \`Optional\` value in a \`List\`
-}
let head
	: ∀(a : Type) → List (Optional a) → Optional a
	= λ(a : Type) →
		λ(xs : List (Optional a)) →
			List/fold
				(Optional a)
				xs
				(Optional a)
				( λ(l : Optional a) →
					λ(r : Optional a) →
						merge { Some = λ(x : a) → Some x, None = r } l
				)
				(None a)

let example0 = assert : head Natural [ None Natural, Some 1, Some 2 ] ≡ Some 1

let example1 =
		assert : head Natural [ None Natural, None Natural ] ≡ None Natural

let example2 =
		assert : head Natural ([] : List (Optional Natural)) ≡ None Natural

in  head
`,
	diff: `Normal Diff
7c7
< qt: core
---
> qt: core quick

Context Diff
*** qcli.yml	2014-12-16 11:43:41.000000000 +0800
--- /Users/uranusjr/Desktop/qcli.yml	2014-12-31 11:28:08.000000000 +0800
***************
*** 4,8 ****
	project:
			sources: "src/*.cpp"
			headers: "src/*.h"
!     qt: core
	public_headers: "src/*.h"
--- 4,8 ----
	project:
			sources: "src/*.cpp"
			headers: "src/*.h"
!     qt: core gui
	public_headers: "src/*.h"

Unified Diff
--- qcli.yml	2014-12-16 11:43:41.000000000 +0800
+++ /Users/uranusjr/Desktop/qcli.yml	2014-12-31 11:28:08.000000000 +0800
@@ -4,5 +4,5 @@
	project:
			sources: "src/*.cpp"
			headers: "src/*.h"
-     qt: core
+     qt: core gui
	public_headers: "src/*.h"
`,
	django: `{# Comment #}
{# This is a comment #}

{# Variable #}
{{ some_variable }}

{# Template Tag #}
{% if some_condition %}
Conditional block
{% endif %}

{# Full Example #}
{# This is a Django template example #}
{% extends "base_generic.html" %}

{% block title %}{{ section.title }}{% endblock %}

{% block content %}
<h1>{{ section.title }}</h1>

{% for story in story_list %}
<h2>
	<a href="{{ story.get_absolute_url }}">
		{{ story.headline|upper }}
	</a>
</h2>
<p>{{ story.tease|truncatewords:"100" }}</p>
{% endfor %}
{% endblock %}
`,
	"dns-zone-file": `; Full example
$TTL 3d
@ IN SOA root.localhost. root.sneaky.net. (
		2015050503 ; serial
		12h        ; refresh
		15m        ; retry
		3w         ; expire
		3h         ; negative response TTL
	)
	IN NS root.localhost.
	IN NS localhost. ; secondary name server is preferably externally maintained

www IN A 3.141.59.26
ww1 IN CNAME www
`,
	dot: `// Full example
// source: http://www.ryandesign.com/canviz/graphs/dot/directed/ctext.gv.txt
# Generated Tue Aug 21 10:21:21 GMT 2007 by dot - Graphviz version 2.15.20070819.0440 (Tue Aug 21 09:56:32 GMT 2007)
#
#
# real	0m0.105s
# user	0m0.076s
# sys	0m0.022s

digraph G {
	node [label="\\N"];
	graph [bb="0,0,352,238",
		_draw_="c 5 -white C 5 -white P 4 0 0 0 238 352 238 352 0 ",
		xdotversion="1.2"];
	xyz [label="hello\\nworld", color=slateblue, fontsize=24, fontname="Palatino-Italic", style=filled, fontcolor=hotpink, pos="67,191", width="1.64", height="1.29", _draw_="S 6 -filled c 9 -slateblue C 9 -slateblue E 67 191 59 47 ", _ldraw_="F 24.000000 15 -Palatino-Italic c 7 -hotpink T 67 196 0 65 5 -hello F 24.000000 15 -Palatino-Italic c 7 -hotpink T 67 167 0 75 5\\
 -world "];
	red [color=red, style=filled, pos="171,191", width="0.75", height="0.50", _draw_="S 6 -filled c 3 -red C 3 -red E 171 191 27 18 ", _ldraw_="F 14.000000 11 -Times-Roman c 5 -black T 171 186 0 24 3 -red "];
	green [color=green, style=filled, pos="128,90", width="0.92", height="0.50", _draw_="S 6 -filled c 5 -green C 5 -green E 128 90 33 18 ", _ldraw_="F 14.000000 11 -Times-Roman c 5 -black T 128 85 0 41 5 -green "];
	blue [color=blue, style=filled, fontcolor=black, pos="214,90", width="0.78", height="0.50", _draw_="S 6 -filled c 4 -blue C 4 -blue E 214 90 28 18 ", _ldraw_="F 14.000000 11 -Times-Roman c 5 -black T 214 85 0 31 4 -blue "];
	cyan [color=cyan, style=filled, pos="214,18", width="0.83", height="0.50", _draw_="S 6 -filled c 4 -cyan C 4 -cyan E 214 18 30 18 ", _ldraw_="F 14.000000 11 -Times-Roman c 5 -black T 214 13 0 34 4 -cyan "];
	magenta [color=magenta, style=filled, pos="307,18", width="1.25", height="0.50", _draw_="S 6 -filled c 7 -magenta C 7 -magenta E 307 18 45 18 ", _ldraw_="F 14.000000 11 -Times-Roman c 5 -black T 307 13 0 64 7 -magenta "];
	yellow [color=yellow, style=filled, pos="36,18", width="1.00", height="0.50", _draw_="S 6 -filled c 6 -yellow C 6 -yellow E 36 18 36 18 ", _ldraw_="F 14.000000 11 -Times-Roman c 5 -black T 36 13 0 47 6 -yellow "];
	orange [color=orange, style=filled, pos="128,18", width="1.06", height="0.50", _draw_="S 6 -filled c 6 -orange C 6 -orange E 128 18 38 18 ", _ldraw_="F 14.000000 11 -Times-Roman c 5 -black T 128 13 0 51 6 -orange "];
	red -> green [pos="e,136,108 164,173 157,158 147,135 140,118", _draw_="c 5 -black B 4 164 173 157 158 147 135 140 118 ", _hdraw_="S 5 -solid S 15 -setlinewidth(1) c 5 -black C 5 -black P 3 143 116 136 108 136 119 "];
	red -> blue [pos="e,206,108 178,173 185,158 195,135 202,118", _draw_="c 5 -black B 4 178 173 185 158 195 135 202 118 ", _hdraw_="S 5 -solid S 15 -setlinewidth(1) c 5 -black C 5 -black P 3 206 119 206 108 199 116 "];
	blue -> cyan [pos="e,214,36 214,72 214,64 214,55 214,46", _draw_="c 5 -black B 4 214 72 214 64 214 55 214 46 ", _hdraw_="S 5 -solid S 15 -setlinewidth(1) c 5 -black C 5 -black P 3 218 46 214 36 211 46 "];
	blue -> magenta [pos="e,286,34 232,76 246,66 263,52 278,40", _draw_="c 5 -black B 4 232 76 246 66 263 52 278 40 ", _hdraw_="S 5 -solid S 15 -setlinewidth(1) c 5 -black C 5 -black P 3 280 43 286 34 276 37 "];
	green -> yellow [pos="e,56,33 109,75 96,65 78,51 64,40", _draw_="c 5 -black B 4 109 75 96 65 78 51 64 40 ", _hdraw_="S 5 -solid S 15 -setlinewidth(1) c 5 -black C 5 -black P 3 66 37 56 33 61 42 "];
	green -> orange [pos="e,128,36 128,72 128,64 128,55 128,46", _draw_="c 5 -black B 4 128 72 128 64 128 55 128 46 ", _hdraw_="S 5 -solid S 15 -setlinewidth(1) c 5 -black C 5 -black P 3 132 46 128 36 125 46 "];
}
`,
	docker: `# Comments
# These are the comments for a dockerfile.
# I want to make sure $(variables) don't break out,
# and we shouldn't see keywords like ADD or ENTRYPOINT

# I also want to make sure that this "string" and this 'string' don't break out.

# Full example
# Nginx
#
# VERSION               0.0.1

FROM      ubuntu
MAINTAINER Victor Vieux <victor@docker.com>

LABEL Description="This image is used to start the foobar executable" Vendor="ACME Products" Version="1.0"
RUN apt-get update && apt-get install -y inotify-tools nginx apache2 openssh-server

# Firefox over VNC
#
# VERSION               0.3

FROM ubuntu

# Install vnc, xvfb in order to create a 'fake' display and firefox
RUN apt-get update && apt-get install -y x11vnc xvfb firefox
RUN mkdir ~/.vnc
# Setup a password
RUN x11vnc -storepasswd 1234 ~/.vnc/passwd
# Autostart firefox (might not be the best way, but it does the trick)
RUN bash -c 'echo "firefox" >> /.bashrc'

EXPOSE 5900
CMD    ["x11vnc", "-forever", "-usepw", "-create"]

# Multiple images example
#
# VERSION               0.1

FROM ubuntu
RUN echo foo > bar
# Will output something like ===> 907ad6c2736f

FROM ubuntu
RUN echo moo > oink
# Will output something like ===> 695d7793cbe4

# You᾿ll now have two images, 907ad6c2736f with /bar, and 695d7793cbe4 with
# /oink.
`,
	ebnf: `(* Full example *)
SYNTAX = SYNTAX RULE, { SYNTAX RULE } ;
SYNTAX RULE
	= META IDENTIFIER, '=', DEFINITIONS LIST, ' ;' ;
DEFINITIONS LIST
	= SINGLE DEFINITION,
		{ '|', SINGLE DEFINITION } ;
SINGLE DEFINITION = TERM, { ',', TERM } ;
TERM = FACTOR, [ '-', EXCEPTION ] ;
EXCEPTION = FACTOR ;
FACTOR = [ INTEGER, '*' ], PRIMARY ;
PRIMARY
	= OPTIONAL SEQUENCE | REPEATED SEQUENCE
	| SPECIAL SEQUENCE | GROUPED SEQUENCE
	| META IDENTIFIER | TERMINAL | EMPTY ;
EMPTY = ;
OPTIONAL SEQUENCE = '[', DEFINITIONS LIST, ']' ;
REPEATED SEQUENCE = '{', DEFINITIONS LIST, '}' ;
GROUPED SEQUENCE = '(', DEFINITIONS LIST, ')' ;
TERMINAL
	= "'", CHARACTER - "'",
		{ CHARACTER - "'" }, "'"
	| '"', CHARACTER - '"',
		{ CHARACTER - '"' }, '"' ;
META IDENTIFIER = LETTER, { LETTER | DIGIT } ;
INTEGER = DIGIT, { DIGIT } ;
SPECIAL SEQUENCE = '?', { CHARACTER - '?' }, '?' ;
COMMENT = '(*', { COMMENT SYMBOL }, '*)' ;
COMMENT SYMBOL
	= COMMENT | TERMINAL | SPECIAL SEQUENCE
		| CHARACTER ;

(* Full example with alternative syntax *)
SYNTAX = SYNTAX RULE, (: SYNTAX RULE :).
SYNTAX RULE
	= META IDENTIFIER, '=', DEFINITIONS LIST, '.'. (* '.' instead of ';' *)
DEFINITIONS LIST
	= SINGLE DEFINITION,
		(: '/', SINGLE DEFINITION :).
SINGLE DEFINITION = TERM, (: ',', TERM :).
TERM = FACTOR, (/ '-', EXCEPTION /).
EXCEPTION = FACTOR.
FACTOR = (/ INTEGER, '*' /), PRIMARY.
PRIMARY
	= OPTIONAL SEQUENCE / REPEATED SEQUENCE (* / is the same as | *)
	/ SPECIAL SEQUENCE / GROUPED SEQUENCE
	/ META IDENTIFIER / TERMINAL / EMPTY.
EMPTY = .
OPTIONAL SEQUENCE = '(/', DEFINITIONS LIST, '/)'.
REPEATED SEQUENCE = '(:', DEFINITIONS LIST, ':)'.
GROUPED SEQUENCE = '(', DEFINITIONS LIST, ')'.
TERMINAL
	= "'", CHARACTER - "'",
		(: CHARACTER - "'" :), "'"
	/ '"', CHARACTER - '"',
		(: CHARACTER - '"' :), '"'.
META IDENTIFIER = LETTER, (: LETTER / DIGIT :).
INTEGER = DIGIT, (: DIGIT :).
SPECIAL SEQUENCE = '?', (: CHARACTER - '?' :), '?'.
COMMENT = '(*', (: COMMENT SYMBOL :), '*)'.
COMMENT SYMBOL
	= COMMENT / TERMINAL / SPECIAL SEQUENCE
		/ CHARACTER.
`,
	editorconfig: `# Comment
# This is a comment
; And this is too

# Section Header
[*]
[*.js]
[*.{bash,sh,zsh}]

# Key-Value Pair
key = value
indent_style = space

# Full example
# EditorConfig is awesome: https://EditorConfig.org

# top-most EditorConfig file
root = true

# Unix-style newlines with a newline ending every file
[*]
end_of_line = lf
insert_final_newline = true

# Matches multiple files with brace expansion notation
# Set default charset
[*.{js,py}]
charset = utf-8

# 4 space indentation
[*.py]
indent_style = space
indent_size = 4

# Tab indentation (no size specified)
[Makefile]
indent_style = tab

# Indentation override for all JS under lib directory
[lib/**.js]
indent_style = space
indent_size = 2

# Matches the exact files either package.json or .travis.yml
[{package.json,.travis.yml}]
indent_style = space
indent_size = 2
`,
	eiffel: `-- Comments
-- A comment

-- Simple string and character
"A simple string with %"double quotes%""
'a'

-- Verbatim-strings
"[
	A aligned verbatim string
]"
"{
	A non-aligned verbatim string
}"

-- Numbers
1_000
1_000.
1_000.e+1_000
1_000.1_000e-1_000
.1
0b1010_0001
0xAF_5B
0c75_22

-- Class names
deferred class
	A [G]

feature
	items: G
		deferred  end

end

-- Full example
note
	description: "Represents a person."

class
	PERSON

create
	make, make_unknown

feature {NONE} -- Creation

	make (a_name: like name)
		-- Create a person with \`a_name' as \`name'.
		do
			name := a_name
		ensure
			name = a_name
		end

		make_unknown
		do ensure
			name = Void
			end

feature -- Access

	name: detachable STRING
		-- Full name or Void if unknown.

end
`,
	ejs: `<%# Full example %>
<h1>Let's have fun!</h1>
<%
	const fruits = ["Apple", "Pear", "Orange", "Lemon"];
	const random = Array.from({ length: 198 }).map(x => Math.random());
%>

<p>These fruits are amazing:</p>
<ul><% for (const fruit of fruits) { %>
	<li><%=fruit%>s</li><% } %>
</ul>

<p>Some random numbers:</p>

<% random.forEach((c, i) => {
%> <%- c.toFixed(10) + ((i + 1) % 6 === 0 ? " <br>\\n": "") %><%});%>
`,
	elixir: `# Comments
# This is a comment

# Atoms
:foo
:bar

# Numbers
42
0b1010
0o777
0x1F
3.14159
5.2e10
100_000

# Strings and heredoc
'A string with \\'quotes\\'!'
"A string with \\"quotes\\"!"
"Multi-line
strings are supported"
""" "Heredoc" strings are
also supported.
"""

# Sigils
~s"""This is a sigil
using heredoc delimiters"""
~r/a [reg]exp/
~r(another|regexp)
~w[some words]s
~c<a char list>

# Interpolation
"This is an #{:atom}"
~s/#{40+2} is the answer/

# Function capturing
fun = &Math.zero?/1
(&is_function/1).(fun)
fun = &(&1 + 1)
fun.(1)
fun = &List.flatten(&1, &2)
fun.([1, [[2], 3]], [4, 5])

# Module attributes
defmodule MyServer do
	@vsn 2
end

defmodule Math do
	@moduledoc """
	Provides math-related functions.

		iex> Math.sum(1, 2)
		3

	"""

	@doc """
	Calculates the sum of two numbers.
	"""
	def sum(a, b), do: a + b
end

# Full example
# Example from http://learnxinyminutes.com/docs/elixir/

# Single line comments start with a number symbol.

# There's no multi-line comment,
# but you can stack multiple comments.

# To use the elixir shell use the \`iex\` command.
# Compile your modules with the \`elixirc\` command.

# Both should be in your path if you installed elixir correctly.

## ---------------------------
## -- Basic types
## ---------------------------

# There are numbers
3    # integer
0x1F # integer
3.0  # float

# Atoms, that are literals, a constant with name. They start with \`:\`.
:hello # atom

# Tuples that are stored contiguously in memory.
{1,2,3} # tuple

# We can access a tuple element with the \`elem\` function:
elem({1, 2, 3}, 0) #=> 1

# Lists that are implemented as linked lists.
[1,2,3] # list

# We can access the head and tail of a list as follows:
[head | tail] = [1,2,3]
head #=> 1
tail #=> [2,3]

# In elixir, just like in Erlang, the \`=\` denotes pattern matching and
# not an assignment.
#
# This means that the left-hand side (pattern) is matched against a
# right-hand side.
#
# This is how the above example of accessing the head and tail of a list works.

# A pattern match will error when the sides don't match, in this example
# the tuples have different sizes.
# {a, b, c} = {1, 2} #=> ** (MatchError) no match of right hand side value: {1,2}

# There are also binaries
<<1,2,3>> # binary

# Strings and char lists
"hello" # string
'hello' # char list

# Multi-line strings
"""
I'm a multi-line
string.
"""
#=> "I'm a multi-line\\nstring.\\n"

# Strings are all encoded in UTF-8:
"héllò" #=> "héllò"

# Strings are really just binaries, and char lists are just lists.
<<?a, ?b, ?c>> #=> "abc"
[?a, ?b, ?c]   #=> 'abc'

# \`?a\` in elixir returns the ASCII integer for the letter \`a\`
?a #=> 97

# To concatenate lists use \`++\`, for binaries use \`<>\`
[1,2,3] ++ [4,5]     #=> [1,2,3,4,5]
'hello ' ++ 'world'  #=> 'hello world'

<<1,2,3>> <> <<4,5>> #=> <<1,2,3,4,5>>
"hello " <> "world"  #=> "hello world"

# Ranges are represented as \`start..end\` (both inclusive)
1..10 #=> 1..10
lower..upper = 1..10 # Can use pattern matching on ranges as well
[lower, upper] #=> [1, 10]

## ---------------------------
## -- Operators
## ---------------------------

# Some math
1 + 1  #=> 2
10 - 5 #=> 5
5 * 2  #=> 10
10 / 2 #=> 5.0

# In elixir the operator \`/\` always returns a float.

# To do integer division use \`div\`
div(10, 2) #=> 5

# To get the division remainder use \`rem\`
rem(10, 3) #=> 1

# There are also boolean operators: \`or\`, \`and\` and \`not\`.
# These operators expect a boolean as their first argument.
true and true #=> true
false or true #=> true
# 1 and true    #=> ** (ArgumentError) argument error

# Elixir also provides \`||\`, \`&&\` and \`!\` which accept arguments of any type.
# All values except \`false\` and \`nil\` will evaluate to true.
1 || true  #=> 1
false && 1 #=> false
nil && 20  #=> nil
!true #=> false

# For comparisons we have: \`==\`, \`!=\`, \`===\`, \`!==\`, \`<=\`, \`>=\`, \`<\` and \`>\`
1 == 1 #=> true
1 != 1 #=> false
1 < 2  #=> true

# \`===\` and \`!==\` are more strict when comparing integers and floats:
1 == 1.0  #=> true
1 === 1.0 #=> false

# We can also compare two different data types:
1 < :hello #=> true

# The overall sorting order is defined below:
# number < atom < reference < functions < port < pid < tuple < list < bit string

# To quote Joe Armstrong on this: "The actual order is not important,
# but that a total ordering is well defined is important."

## ---------------------------
## -- Control Flow
## ---------------------------

# \`if\` expression
if false do
	"This will never be seen"
else
	"This will"
end

# There's also \`unless\`
unless true do
	"This will never be seen"
else
	"This will"
end

# Remember pattern matching? Many control-flow structures in elixir rely on it.

# \`case\` allows us to compare a value against many patterns:
case {:one, :two} do
	{:four, :five} ->
		"This won't match"
	{:one, x} ->
		"This will match and bind \`x\` to \`:two\`"
	_ ->
		"This will match any value"
end

# It's common to bind the value to \`_\` if we don't need it.
# For example, if only the head of a list matters to us:
[head | _] = [1,2,3]
head #=> 1

# For better readability we can do the following:
[head | _tail] = [:a, :b, :c]
head #=> :a

# \`cond\` lets us check for many conditions at the same time.
# Use \`cond\` instead of nesting many \`if\` expressions.
cond do
	1 + 1 == 3 ->
		"I will never be seen"
	2 * 5 == 12 ->
		"Me neither"
	1 + 2 == 3 ->
		"But I will"
end

# It is common to set the last condition equal to \`true\`, which will always match.
cond do
	1 + 1 == 3 ->
		"I will never be seen"
	2 * 5 == 12 ->
		"Me neither"
	true ->
		"But I will (this is essentially an else)"
end

# \`try/catch\` is used to catch values that are thrown, it also supports an
# \`after\` clause that is invoked whether or not a value is caught.
try do
	throw(:hello)
catch
	message -> "Got #{message}."
after
	IO.puts("I'm the after clause.")
end
#=> I'm the after clause
# "Got :hello"

## ---------------------------
## -- Modules and Functions
## ---------------------------

# Anonymous functions (notice the dot)
square = fn(x) -> x * x end
square.(5) #=> 25

# They also accept many clauses and guards.
# Guards let you fine tune pattern matching,
# they are indicated by the \`when\` keyword:
f = fn
	x, y when x > 0 -> x + y
	x, y -> x * y
end

f.(1, 3)  #=> 4
f.(-1, 3) #=> -3

# Elixir also provides many built-in functions.
# These are available in the current scope.
is_number(10)    #=> true
is_list("hello") #=> false
elem({1,2,3}, 0) #=> 1

# You can group several functions into a module. Inside a module use \`def\`
# to define your functions.
defmodule Math do
	def sum(a, b) do
		a + b
	end

	def square(x) do
		x * x
	end
end

Math.sum(1, 2)  #=> 3
Math.square(3) #=> 9

# To compile our simple Math module save it as \`math.ex\` and use \`elixirc\`
# in your terminal: elixirc math.ex

# Inside a module we can define functions with \`def\` and private functions with \`defp\`.
# A function defined with \`def\` is available to be invoked from other modules,
# a private function can only be invoked locally.
defmodule PrivateMath do
	def sum(a, b) do
		do_sum(a, b)
	end

	defp do_sum(a, b) do
		a + b
	end
end

PrivateMath.sum(1, 2)    #=> 3
# PrivateMath.do_sum(1, 2) #=> ** (UndefinedFunctionError)

# Function declarations also support guards and multiple clauses:
defmodule Geometry do
	def area({:rectangle, w, h}) do
		w * h
	end

	def area({:circle, r}) when is_number(r) do
		3.14 * r * r
	end
end

Geometry.area({:rectangle, 2, 3}) #=> 6
Geometry.area({:circle, 3})       #=> 28.25999999999999801048
# Geometry.area({:circle, "not_a_number"})
#=> ** (FunctionClauseError) no function clause matching in Geometry.area/1

# Due to immutability, recursion is a big part of elixir
defmodule Recursion do
	def sum_list([head | tail], acc) do
		sum_list(tail, acc + head)
	end

	def sum_list([], acc) do
		acc
	end
end

Recursion.sum_list([1,2,3], 0) #=> 6

# Elixir modules support attributes, there are built-in attributes and you
# may also add custom ones.
defmodule MyMod do
	@moduledoc """
	This is a built-in attribute on a example module.
	"""

	@my_data 100 # This is a custom attribute.
	IO.inspect(@my_data) #=> 100
end

## ---------------------------
## -- Structs and Exceptions
## ---------------------------

# Structs are extensions on top of maps that bring default values,
# compile-time guarantees and polymorphism into Elixir.
defmodule Person do
	defstruct name: nil, age: 0, height: 0
end

joe_info = %Person{ name: "Joe", age: 30, height: 180 }
#=> %Person{age: 30, height: 180, name: "Joe"}

# Access the value of name
joe_info.name #=> "Joe"

# Update the value of age
older_joe_info = %{ joe_info | age: 31 }
#=> %Person{age: 31, height: 180, name: "Joe"}

# The \`try\` block with the \`rescue\` keyword is used to handle exceptions
try do
	raise "some error"
rescue
	RuntimeError -> "rescued a runtime error"
	_error -> "this will rescue any error"
end

# All exceptions have a message
try do
	raise "some error"
rescue
	x in [RuntimeError] ->
		x.message
end

## ---------------------------
## -- Concurrency
## ---------------------------

# Elixir relies on the actor model for concurrency. All we need to write
# concurrent programs in elixir are three primitives: spawning processes,
# sending messages and receiving messages.

# To start a new process we use the \`spawn\` function, which takes a function
# as argument.
f = fn -> 2 * 2 end #=> #Function<erl_eval.20.80484245>
spawn(f) #=> #PID<0.40.0>

# \`spawn\` returns a pid (process identifier), you can use this pid to send
# messages to the process. To do message passing we use the \`send\` operator.
# For all of this to be useful we need to be able to receive messages. This is
# achieved with the \`receive\` mechanism:
defmodule Geometry do
	def area_loop do
		receive do
			{:rectangle, w, h} ->
				IO.puts("Area = #{w * h}")
				area_loop()
			{:circle, r} ->
				IO.puts("Area = #{3.14 * r * r}")
				area_loop()
		end
	end
end

# Compile the module and create a process that evaluates \`area_loop\` in the shell
pid = spawn(fn -> Geometry.area_loop() end) #=> #PID<0.40.0>

# Send a message to \`pid\` that will match a pattern in the receive statement
send pid, {:rectangle, 2, 3}
#=> Area = 6
#   {:rectangle,2,3}

send pid, {:circle, 2}
#=> Area = 12.56000000000000049738
#   {:circle,2}

# The shell is also a process, you can use \`self\` to get the current pid
self() #=> #PID<0.27.0>
`,
	elm: `-- Comments
-- Single line comment
{- Multi-line
comment -}

-- Strings and characters
'a'
'\\n'
'\\x03'
"foo \\" bar"
"""
"multiline strings" are also
supported!
"""

-- Full example
module Main exposing (..)

import Html exposing (Html)
import Svg exposing (..)
import Svg.Attributes exposing (..)
import Time exposing (Time, second)


main =
	Html.program
		{ init = init
		, view = view
		, update = update
		, subscriptions = subscriptions
		}



-- MODEL


type alias Model =
	Time


init : ( Model, Cmd Msg )
init =
	( 0, Cmd.none )



-- UPDATE


type Msg
	= Tick Time


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
	case msg of
		Tick newTime ->
			( newTime, Cmd.none )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
	Time.every second (\\time -> Tick time)



-- VIEW


view : Model -> Html Msg
view model =
	let
		angle =
			turns (Time.inMinutes model)

		handX =
			toString (50 + 40 * cos angle)

		handY =
			toString (50 + 40 * sin angle)
	in
	svg [ viewBox "0 0 100 100", width "300px" ]
		[ circle [ cx "50", cy "50", r "45", fill "#0B79CE" ] []
		, line [ x1 "50", y1 "50", x2 handX, y2 handY, stroke "#023963" ] []
		]
`,
	erb: `<!-- Full example -->
<%# index.erb %>
<h1>Listing Books</h1>
<table>
	<tr>
		<th>Title</th>
		<th>Summary</th>
		<th></th>
		<th></th>
		<th></th>
	</tr>

<% @books.each do |book| %>
	<tr>
		<td><%= book.title %></td>
		<td><%= book.content %></td>
		<td><%= link_to "Show", book %></td>
		<td><%= link_to "Edit", edit_book_path(book) %></td>
		<td><%= link_to "Remove", book, method: :delete, data: { confirm: "Are you sure?" } %></td>
	</tr>
<% end %>
</table>
`,
	erlang: `% Comments
% This is a comment
%% coding: utf-8

% Strings
"foo \\"bar\\" baz"

% Numbers
42.
$A.
$\\n.
2#101.
16#1f.
2.3.
2.3e3.
2.3e-3.

% Functions
P = spawn(m, loop, []).
io:format("I am ~p~n", [self()]).
'weird function'().

% Variables
P = {adam,24,{july,29}}.
M1 = #{name=>adam,age=>24,date=>{july,29}}.
M2 = maps:update(age,25,M1).
io:format("{~p,~p}: ~p~n", [?MODULE,?LINE,X]).

% Operators
1==1.0.
1=:=1.0.
1 > a.
+1.
-1.
1+1.
4/2.
5 div 2.
5 rem 2.
2#10 band 2#01.
2#10 bor 2#01.
a + 10.
1 bsl (1 bsl 64).
not true.
true and false.
true xor false.
true or garbage.
`,
	etlua: `<!-- Full example -->
<div class="foo">
	<% if true then %>
		Hello <%= name %>,
		Here are your items:
		<% for i, item in pairs(items) do %>
			 * <%= item -%>
			<% --[[ comment block ]] %>
		<% end %>
		<%- "<b>this is not escaped</b>" %>
	<% end %>
</div>
`,
	"excel-formula": `N(" Full example ")
=SUM(G7*9)
=INT(RAND()*999)
=AVERAGE(A4:A13)+N("Average user rating")
=CONCATENATE(F4, ",", " ", G4," ",H4)
=IF($A4>500, $A4, 0)
=AND($B4>=501,$C4<=500)
=SUBTOTAL(103,staff[Name])
=TRIMMEAN(staff[Salary],10%)
=SUM([Sales.xlsx]Jan!B2:B5)
`,
	factor: `! Comments
! FIXME: a comment

USE: multiline

![[ comment ]]
/* comment */

! Strings
"a string" "\\"" "\\x8" "%s"

SBUF" asbdef"

USE: multiline

STRING: name
content
;

HEREDOC: marker
text
marker

[==[
	str
	ing
]==]

! Numbers
5 1/5 +9 -9 +1/5 -1/5 -1/5. 23+1/5 -23-1/5 23-1/5 ! NOTE: last one = word

+12.13 0.01 0e0 3E4 3e-4 3E-4 030 0xd 0o30 0b1100
-12.13 -0 -0.01 -0e0 -3E4 -3E-4 -030 -0xd -0o30 -0b1100

348756424956392657834385437598743583648756332457
-348756424956392657834385437598743583648756332457

NAN: a
NAN: 80000deadbeef

0b1.010p2 0x1.0p3 0x1.p1 0b1.111111p1111 ...

! Sequences
{ 1 2 3 4 }
{ a b c d e t f }
{ "a" "b" "c" }

{ { a b } { c d } }
H{ { a b } { c d } }
H{ { "a" "b" } { "c" "d" } }
V{ 1 2 3 4 }
V{ "1" "2" "3" "4" }
BV{ 1 2 3 4 }

! Regular Expressions
USE: regexp
R/ abcde?.*+\\?\\.\\*\\+\\/\\\\\\/idmsr-idmsr/idmsr-idmsr

! Colon parsing words
: a ( -- ) ;
:: ; ! ; is not a word name
:: ;a ! ;a is a word name
USING: a b c ;
USE: a
IN: a.b
CHAR: a
GENERIC#: x 1 ( x: integer quot: ( x -- y ) -- )

! Special words (builtins, conventions)
and not with map filter

new last-index + - neg

<array> <=> SYNTAX: x $[ xyz ]

set-x change-x with-variable ?of if* (gensym) hex. $description reader>> >>setter writer<<

string>number >hex base> mutater!

! Full example
USING: accessors arrays assocs combinators
combinators.short-circuit effects io kernel sequences
sequences.deep splitting strings vocabs words ;
IN: prism

: make-prism-syntax ( syntax-vocab -- seq )
 	vocab-words [
		dup name>> ">>" = [ drop t ] [
			{
				[ "delimiter" word-prop ]
				[ name>> last { CHAR: : CHAR: { CHAR: [ CHAR: ( CHAR: ) CHAR: ? CHAR: " } member? ]
				[ name>> { "t" "f" } member? ]
			} 1|| not
		] if
	] filter ;

: combinator? ( word -- ? )
	[ "declared-effect" word-prop in>> flatten
		[
			[ effect? ] [ { "quots" "quot" } member? ] bi or
		] any?
	] [
		"help" word-prop ?first flatten [ dup word? [ name>> ] when "quot" swap subseq? ] any?
	] bi or ;

: classify ( vocab-spec -- seq )
	vocab-words [
		dup {
			{ [ dup combinator? ] [ drop "combinator" ] }
			{ [ dup "macro" word-prop ] [ drop "macro" ] }
			[ drop "ordinary" ]
		} cond 2array
	] map ;

: print-strings ( strs -- )
	[ name>> "'" dup surround ] map ", " join print ; recursive ! WARN: not recursive

: combinators. ( vocab-spec -- )
	classify [ nip "combinator" = ] assoc-filter keys print-strings ; flushable

: ordinaries. ( vocab-spec -- )
	classify [ nip "ordinary" = ] assoc-filter keys print-strings ; foldable

: macros. ( vocab-spec -- )
	classify [ nip "macro" = ] assoc-filter keys print-strings ; inline
`,
	false: `{ Hello, world! }
"Hello, world!"

{ Increment }
5 [7+]! . {Outputs 12.}

{ Square numbers }
[$*] s: 7s;! . {Outputs 49.}

{ Equal, less, or greater than }
5x:
7y:
x;y;=
$
x;
.
[" equals "]?
~[
	x;y;>
	$
	[" is greater than "]?
	~[" is less than "]?
]?
y;
.

{ English alphabet }
'Ai: 'Zm: 1m;+ m: [m;i;>][i;, 1i;+ i:]#

{ Ten Green Bottles }
[$ . " green bottle" 1> ["s"]? ".
"] f:
10n: [n;0>][n;f;! n;1- n:]#

{ Reverse a string }
"Enter the string character by character (or a space to finish):
"0i: [ß ^ $ 32=~][i;1+ i:]# % "Reverse: " [i;0>][, i;1- i:]#
`,
	"firestore-security-rules": `// Full example
rules_version = '2';
service cloud.firestore {

	match /databases/{database}/documents {

		// Returns \`true\` if the requested post is 'published'
		// or the user authored the post
		function authorOrPublished() {
			return resource.data.published == true || request.auth.uid == resource.data.author;
		}

		match /{path=**}/posts/{post} {

			// Anyone can query published posts
			// Authors can query their unpublished posts
			allow list: if authorOrPublished();

			// Anyone can retrieve a published post
			// Authors can retrieve an unpublished post
			allow get: if authorOrPublished();
		}

		match /forums/{forumid}/posts/{postid} {
			// Only a post's author can write to a post
			allow write: if request.auth.uid == resource.data.author;
		}
	}

	match /databases/{database}/reviews {
		// Assign roles to all users and refine access based on user roles
		match /some_collection/{document} {
			allow read: if get(/databases/$(database)/reviews/users/$(request.auth.uid)).data.role == "Reader"
			allow write: if get(/databases/$(database)/reviews/users/$(request.auth.uid)).data.role == "Writer"
		}
	}
}
`,
	flow: `// Primitive types
function method(x: number, y: string, z: boolean) {}
function stringifyBasicValue(value: string | number) {}
function add(one: any, two: any): number {
	return one + two;
}

const bar: number = 2;
var barVar: number = 2;
let barLet: number = 2;
let isOneOf: number | boolean | string = foo;

// Keywords
type UnionAlias = 1 | 2 | 3;
opaque type ID = string;
declare opaque type PositiveNumber: number;
type Country = $Keys<typeof countries>;
type RequiredProps = $Diff<Props, DefaultProps>;
`,
	fortran: `! Comments
! This is a comment

! Strings
"foo 'bar' baz"
'foo ''bar'' baz'
''
ITALICS_'This is in italics'
"test &
	! Some "tricky comment" here
	&test"

! Numbers
473
+56
-101
21_2
21_SHORT
1976354279568241_8
B'01110'
B"010"
O'047'
O"642"
Z'F41A'
Z"00BC"
-12.78
+1.6E3
2.1
-16.E4_8
0.45E-4
10.93E7_QUAD
.123
3E4

! Full example
MODULE MOD1
TYPE INITIALIZED_TYPE
	INTEGER :: I = 1 ! Default initialization
END TYPE INITIALIZED_TYPE
SAVE :: SAVED1, SAVED2
INTEGER :: SAVED1, UNSAVED1
TYPE(INITIALIZED_TYPE) :: SAVED2, UNSAVED2
ALLOCATABLE :: SAVED1(:), SAVED2(:), UNSAVED1(:), UNSAVED2(:)
END MODULE MOD1

PROGRAM MAIN
CALL SUB1 ! The values returned by the ALLOCATED intrinsic calls
					! in the PRINT statement are:
					! .FALSE., .FALSE., .FALSE., and .FALSE.
					! Module MOD1 is used, and its variables are allocated.
					! After return from the subroutine, whether the variables
					! which were not specified with the SAVE attribute
					! retain their allocation status is processor dependent.
CALL SUB1 ! The values returned by the first two ALLOCATED intrinsic
					! calls in the PRINT statement are:
					! .TRUE., .TRUE.
					! The values returned by the second two ALLOCATED
					! intrinsic calls in the PRINT statement are
					! processor dependent and each could be either
					! .TRUE. or .FALSE.
CONTAINS
	SUBROUTINE SUB1
	USE MOD1 ! Brings in saved and not saved variables.
	PRINT *, ALLOCATED(SAVED1), ALLOCATED(SAVED2), &
					 ALLOCATED(UNSAVED1), ALLOCATED(UNSAVED2)
	IF (.NOT. ALLOCATED(SAVED1)) ALLOCATE(SAVED1(10))
	IF (.NOT. ALLOCATED(SAVED2)) ALLOCATE(SAVED2(10))
	IF (.NOT. ALLOCATED(UNSAVED1)) ALLOCATE(UNSAVED1(10))
	IF (.NOT. ALLOCATED(UNSAVED2)) ALLOCATE(UNSAVED2(10))
	END SUBROUTINE SUB1
END PROGRAM MAIN
`,
	fsharp: `// Comments
// Single line comment
(* Multi-line
comment *)

// Strings
"foo \\"bar\\" baz"
@"Verbatim strings"
"""Alternate "verbatim" strings"""

// Numbers
//8 bit Int
86y
0b00000101y
//Unsigned 8 bit Int
86uy
0b00000101uy
//16 bit Int
86s
//Unsigned 16 bit Int
86us
//Int
86
86l
0b10000
0x2A6
//Unsigned Int
86u
86ul
//unativeint
0x00002D3Fun
//Long
86L
//Unsigned Long
86UL
//Float
4.14F
4.14f
4.f
4.F
0x0000000000000000lf
//Double
4.14
2.3E+32
2.3e+32
2.3e-32
2.3e32
0x0000000000000000LF
//BigInt
9999999999999999999999999999I
//Decimal
0.7833M
0.7833m
3.m
3.M

// Full example
// The declaration creates a constructor that takes two values, name and age.
type Person(name:string, age:int) =
	// A Person object's age can be changed. The mutable keyword in the
	// declaration makes that possible.
	let mutable internalAge = age

	// Declare a second constructor that takes only one argument, a name.
	// This constructor calls the constructor that requires two arguments,
	// sending 0 as the value for age.
	new(name:string) = Person(name, 0)

	// A read-only property.
	member this.Name = name
	// A read/write property.
	member this.Age
		with get() = internalAge
		and set(value) = internalAge <- value

	// Instance methods.
	// Increment the person's age.
	member this.HasABirthday () = internalAge <- internalAge + 1

	// Check current age against some threshold.
	member this.IsOfAge targetAge = internalAge >= targetAge

	// Display the person's name and age.
	override this.ToString () =
		"Name:  " + name + "\\n" + "Age:   " + (string)internalAge

// XMLDoc
/// <summary>
/// Summary documentation goes here.
/// </summary>
`,
	ftl: `<#-- Full example -->
<html>
<head>
	<title>Welcome!</title>
</head>
<body>
	<h1>
		Welcome \${user}<#if user == "Big Joe">, our beloved leader</#if>!
	</h1>
	<p>Our latest product:</p>
	<a href="\${latestProduct.url}">\${latestProduct.name}</a>!
	<p>See what our happy customers have to say!</p>
	<ul>
	<#list userStories as story>
		<li>
			<p>\${story.text?esc} - by <span>\${story.user.name}</span></p>
		</li>
	</#list>
	</ul>
</body>
</html>
`,
	gap: `# Full example
# Source: https://www.gap-system.org/Manuals/doc/ref/chap4.html#X815F71EA7BC0EB6F
gap> fib := function ( n )
>     local f1, f2, f3, i;
>     f1 := 1; f2 := 1;
>     for i in [3..n] do
>       f3 := f1 + f2;
>       f1 := f2;
>       f2 := f3;
>     od;
>     return f2;
>   end;;
gap> List( [1..10], fib );
[ 1, 1, 2, 3, 5, 8, 13, 21, 34, 55 ]
`,
	gcode: `; Comments
; comment
(some more comments)
G28 (even in here) X0

; Quoted strings
"foo""bar"

; Full example
M190 S60 ; Heat bed to 60°C
G21 ; Set units to millimeters
G28 ; Move to Origin (Homing)
G29 ; Auto Bed Leveling
G28 X0 Y0 ; Home X and Y to min endstops
M107 ; Fan off
M109 S200 ; Heat hotend to 200°C
G92 E0 ; Set current extruder position as zero
G1 F200 E15 ; Extrude 15mm filament with 200mm/min
G92 E0 ; Set current extruder position as zero
G1 F500
`,
	gdscript: `# Full example
extends BaseClass
class_name MyClass, "res://path/to/optional/icon.svg"

# Member Variables

var a = 5
var s = "Hello"
var arr = [1, 2, 3]
var dict = {"key": "value", 2:3}
var typed_var: int
var inferred_type := "String"

# Constants

const ANSWER = 42
const THE_NAME = "Charly"

# Enums

enum {UNIT_NEUTRAL, UNIT_ENEMY, UNIT_ALLY}
enum Named {THING_1, THING_2, ANOTHER_THING = -1}

# Built-in Vector Types

var v2 = Vector2(1, 2)
var v3 = Vector3(1, 2, 3)

# Function

func some_function(param1, param2):
	var local_var = 5

	if param1 < local_var:
		print(param1)
	elif param2 > 5:
		print(param2)
	else:
		print("Fail!")

	for i in range(20):
		print(i)

	while param2 != 0:
		param2 -= 1

	var local_var2 = param1 + 3
	return local_var2

# Functions override functions with the same name on the base/parent class.
# If you still want to call them, use '.' (like 'super' in other languages).

func something(p1, p2):
	.something(p1, p2)

# Inner Class

class Something:
	var a = 10

# Constructor

func _init():
	print("Constructed!")
	var lv = Something.new()
	print(lv.a)
`,
	gettext: `# Full example
#  Source: https://www.gnu.org/software/gettext/manual/html_node/PO-Files.html
#: lib/error.c:116
msgid "Unknown system error"
msgstr "Error desconegut del sistema"
`,
	gherkin: `# Strings
"foo \\"bar\\" baz"
'foo \\'bar\\' baz'

"""
Some Title, Eh?
===============
Here is the first paragraph of my blog post.
Lorem ipsum dolor sit amet, consectetur adipiscing
elit.
"""

# Keywords
Feature: Some terse yet descriptive text of what is desired
	In order to realize a named business value
	As an explicit system actor
	I want to gain some beneficial outcome which furthers the goal

	Additional text...

	Scenario: Some determinable business situation
	Given some precondition
	And some other precondition
	When some action by the actor
	And some other action
	And yet another action
	Then some testable outcome is achieved
	And something else we can check happens too

	Scenario: A different situation
	...

# Comments and tags
# user.feature
@users
Feature: Sign in to the store
	In order to view my orders list
	As a visitor
	I need to be able to log in to the store

	@javascript @login
	Scenario: Trying to login without credentials
		Given I am on the store homepage
		And I follow "Login"
		When I press "Login"
		Then I should be on login page
		# And I should see "Invalid credentials"

# Tables and parameters
Scenario Outline: Eating
	Given there are <start> cucumbers
	When I eat <eat> cucumbers
	Then I should have <left> cucumbers

	Examples:
		| start | eat | left |
		|  12   |  5  |  7   |
		|  20   |  5  |  15  |

# Localized keywords
#language: fr
Fonctionnalité: Contrôle le format de la valeur saisie d'un champ d'une révision
	En tant qu'expert ou analyste
	Je ne dois pas pouvoir soumettre des données au mauvais format

	Contexte:
		Etant donné que je suis connecté avec le pseudo "p_flore" et le mot de passe "p4flore"
		Et que la gamme du contrat 27156 supporte les révisions
		Etant donné que le contrat ayant l'id "27156" a une révision
		Et je suis sur "/contrat/27156/revision/1"
		Et que j'attends quelques secondes
		...
`,
	git: `# Comments
# On branch prism-examples
# Changes to be committed:
#   (use "git reset HEAD <file>..." to unstage)
#
#       new file:   examples/prism-git.html

# Inserted and deleted lines
- Some deleted line
+ Some added line

# Diff
$ git diff
diff --git file.txt file.txt
index 6214953..1d54a52 100644
--- file.txt
+++ file.txt
@@ -1 +1,2 @@
-Here's my tetx file
+Here's my text file
+And this is the second line

# Logs
$ git log
commit a11a14ef7e26f2ca62d4b35eac455ce636d0dc09
Author: lgiraudel
Date:   Mon Feb 17 11:18:34 2014 +0100

	Add of a new line

commit 87edc4ad8c71b95f6e46f736eb98b742859abd95
Author: lgiraudel
Date:   Mon Feb 17 11:18:15 2014 +0100

	Typo fix

commit 3102416a90c431400d2e2a14e707fb7fd6d9e06d
Author: lgiraudel
Date:   Mon Feb 17 10:58:11 2014 +0100
`,
	gedcom: `Full example
0 HEAD
1 CHAR ASCII
1 SOUR ID_OF_CREATING_FILE
1 GEDC
2 VERS 5.5
2 FORM Lineage-Linked
1 SUBM @SUBMITTER@
0 @SUBMITTER@ SUBM
1 NAME /Submitter/
1 ADDR Submitters address
2 CONT address continued here
0 @FATHER@ INDI
1 NAME /Father/
1 SEX M
1 BIRT
2 PLAC birth place
2 DATE 1 JAN 1899
1 DEAT
2 PLAC death place
2 DATE 31 DEC 1990
1 FAMS @FAMILY@
0 @MOTHER@ INDI
1 NAME /Mother/
1 SEX F
1 BIRT
2 PLAC birth place
2 DATE 1 JAN 1899
1 DEAT
2 PLAC death place
2 DATE 31 DEC 1990
1 FAMS @FAMILY@
0 @CHILD@ INDI
1 NAME /Child/
1 BIRT
2 PLAC birth place
2 DATE 31 JUL 1950
1 DEAT
2 PLAC death place
2 DATE 29 FEB 2000
1 FAMC @FAMILY@
0 @FAMILY@ FAM
1 MARR
2 PLAC marriage place
2 DATE 1 APR 1950
1 HUSB @FATHER@
1 WIFE @MOTHER@
1 CHIL @CHILD@
0 TRLR
`,
	glsl: `// Vertex shader example
attribute vec3 vertex;
attribute vec3 normal;

uniform mat4 _mvProj;
uniform mat3 _norm;

varying vec3 vColor;
varying vec3 localPos;

#pragma include "light.glsl"

// constants
vec3 materialColor = vec3(1.0,0.7,0.8);
vec3 specularColor = vec3(1.0,1.0,1.0);

void main(void) {
	// compute position
	gl_Position = _mvProj * vec4(vertex, 1.0);

	localPos = vertex;

	// compute light info
	vec3 n = normalize(_norm * normal);
	vec3 diffuse;
	float specular;
	float glowingSpecular = 50.0;
	getDirectionalLight(n, _dLight, glowingSpecular, diffuse, specular);
	vColor = max(diffuse,_ambient.xyz)*materialColor+specular*specularColor+_ambient;
}

// Fragment shader example
#ifdef GL_ES
precision highp float;
#endif

uniform vec3 BrickColor, MortarColor;
uniform vec3 BrickSize;
uniform vec3 BrickPct;

varying vec3 vColor;
varying vec3 localPos;
void main()
{
	vec3 color;
	vec3 position, useBrick;


	position = localPos / BrickSize.xyz;

	if (fract(position.y * 0.5) > 0.5){
		position.x += 0.5;
		position.z += 0.5;
	}

	position = fract(position);

	useBrick = step(position, BrickPct.xyz);

	color = mix(MortarColor, BrickColor, useBrick.x * useBrick.y * useBrick.z);
	color *= vColor;

	gl_FragColor = vec4(color, 1.0);
}
`,
	gml: `// Comments
// This is a comment
/* This is a comment
on multiple lines */

// Functions
variable_instance_set(_inst, _var_name, _start + _change);

// Full example
if (instance_exists(_inst) || _inst==global) {
	if (_delay <= 0) {
		_time += 1;
		if (_time < _duration) {
			event_user(0);
		} else {
			if (_inst != global) {
				variable_instance_set(_inst, _var_name, _start + _change);
			} else {
				variable_global_set(_var_name, _start + _change);
			}
			instance_destroy();
		}
	} else {
		_delay -= 1;
	}
} else {
	instance_destroy();
}
`,
	gn: `# Full example
# Source: https://gn.googlesource.com/gn/+/main/docs/cross_compiles.md

declare_args() {
	# Applies only to toolchains targeting target_cpu.
	sysroot = ""
}

config("my_config") {
	# Uses current_cpu because compile flags are toolchain-dependent.
	if (current_cpu == "arm") {
		defines = [ "CPU_IS_32_BIT" ]
	} else {
		defines = [ "CPU_IS_64_BIT" ]
	}
	# Compares current_cpu with target_cpu to see whether current_toolchain
	# has the same architecture as target_toolchain.
	if (sysroot != "" && current_cpu == target_cpu) {
		cflags = [
			"-isysroot",
			sysroot,
		]
	}
}
`,
	"go-module": `// Full example
// Source: https://go.dev/doc/modules/gomod-ref#example

module example.com/mymodule

go 1.14

require (
	example.com/othermodule v1.2.3
	example.com/thismodule v1.2.3
	example.com/thatmodule v1.2.3
)

replace example.com/thatmodule => ../thatmodule
exclude example.com/thismodule v1.3.0
`,
	go: `// Comments
// This is a comment
/* This is a comment
on multiple lines */

// Numbers
42
0600
0xBadFace
170141183460469231731687303715884105727
0.
72.40
072.40
2.71828
1.e+0
6.67428e-11
1E6
.25
.12345E+5
0i
011i
0.i
2.71828i
1.e+0i
6.67428e-11i
1E6i
.25i
.12345E+5i

// Runes and strings
'\\t'
'\\000'
'\\x07'
'\\u12e4'
'\\U00101234'
\`abc\`
\`multi-line
string\`
"Hello, world!"
"multi-line
string"

// Functions
func(a, b int, z float64) bool { return a*b < int(z) }

// Full example
package main
import "fmt"

func sum(a []int, c chan int) {
	sum := 0
	for _, v := range a {
		sum += v
	}
	c <- sum // send sum to c
}

func main() {
	a := []int{7, 2, 8, -9, 4, 0}

	c := make(chan int)
	go sum(a[:len(a)/2], c)
	go sum(a[len(a)/2:], c)
	x, y := <-c, <-c // receive from c

	fmt.Println(x, y, x+y)
}
`,
	gradle: `// Full example
apply plugin: "java"
apply plugin: "eclipse"
apply plugin: "idea"

group = "com.mycompany.hadoopproject"
version = "1.0"

repositories {
	// Standard Maven 
	mavenCentral()
	maven {
		url "https://repository.cloudera.com/artifactory/cloudera-repos/"
	}
}

// Mimic Maven 'provided' configuration, as suggested in GRADLE-784
configurations {
	provided
}
sourceSets {
	main {
		compileClasspath += configurations.provided
	}
}

ext.hadoopVersion = "2.0.0-mr1-cdh4.0.1"
dependencies {
	provided "org.apache.hadoop:hadoop-client:\${hadoopVersion}"

	// Example of adding a specific compile time dependency
	compile "com.google.guava:guava:11.0.2"

	testCompile "junit:junit:4.8.2"
}

// Java version selection
sourceCompatibility = 1.6
targetCompatibility = 1.6

eclipse {
	classpath {
		// Ensure Eclipse build output appears in build directory
		defaultOutputDir = file("\${buildDir}/eclipse-classes")
		// Ensure the provided configuration jars are available in Eclipse
		plusConfigurations += configurations.provided
	}
}

// Emulate Maven shade plugin with a fat jar.
// http://docs.codehaus.org/display/GRADLE/Cookbook#Cookbook-Creatingafatjar
jar {
	from configurations.compile.collect { it.isDirectory() ? it : zipTree(it) }
}
`,
	graphql: `# Comments
# This is a comment

# Strings
""
"foo \\"bar\\" baz"
""" "Multi-line" strings
are supported."""

# Numbers
0
42
3.14159
-9e-5
0.9E+7

# Keywords
query withFragments {
	user(id: 4) {
		friends(first: 10) {
			...friendFields
		}
		mutualFriends(first: 10) {
			...friendFields
		}
	}
}

fragment friendFields on User {
	id
	name
	profilePic(size: 50)
}

# Descriptions
"""
This is a multiline description
# Heading
[Prism](http://www.prismjs.com)

It can contain **Markdown
	on multiple lines**
"""
type Example {
	id: ID!
}

type Sample {
	"""
	Simple multiline description
	"""
	name(
		"This is a single line description"
		first: Int
	): String
}
`,
	groovy: `// Comments
// Single line comment
/* Multi-line
comment */

// Strings
"foo 'bar' baz"
'foo "bar" baz'
"""Multi-line
string"""
'''Multi-line
string'''
"String /containing/ slashes"

// Slashy strings (regex)
/.*foo.*/
/regex"containing quotes"/
$/.*"(.*)".*/(.*)/$

// Interpolation inside GStrings and regex
"The answer is \${21*2}"
"The $foxtype \${foxcolor.join()} fox"
/foo\${21*2}baz/
'No interpolation here : \${21*2}'

// Full example
#!/usr/bin/env groovy
package model

import groovy.transform.CompileStatic
import java.util.List as MyList

trait Distributable {
	void distribute(String version) {}
}

@CompileStatic
class Distribution implements Distributable {
	double number = 1234.234 / 567
	def otherNumber = 3 / 4
	boolean archivable = condition ?: true
	def ternary = a ? b : c
	String name = "Guillaume"
	Closure description = null
	List<DownloadPackage> packages = []
	String regex = ~/.*foo.*/
	String multi = '''
		multi line string
	''' + """
		now with double quotes and \${gstring}
	""" + $/
		even with dollar slashy strings
	/$

	/**
	 * description method
	 * @param cl the closure
	 */
	void description(Closure cl) { this.description = cl }

	void version(String name, Closure versionSpec) {
		def closure = { println "hi" } as Runnable

		MyList ml = [1, 2, [a: 1, b: 2, c: 3]]
		for (ch in "name") {}

		// single line comment
		DownloadPackage pkg = new DownloadPackage(version: name)

		check that: true

		label:
		def clone = versionSpec.rehydrate(pkg, pkg, pkg)
		/*
			now clone() in a multiline comment
		*/
		clone()
		packages.add(pkg)

		assert 4 / 2 == 2
	}
}
`,
	haml: `-# Comments
/ This is comment
		on multiple lines
/ This is a comment
but this is not
-# This is another comment
		on multiple lines

-# Doctype
!!! XML
!!!
!!! 5

-# Tags
%div
	%span
%span(class="widget_#{@widget.number}")
%div{:id => [@item.type, @item.number], :class => [@item.type, @item.urgency]}
%html{:xmlns => "http://www.w3.org/1999/xhtml", "xml:lang" => "en", :lang => "en"}
%html{html_attrs('fr-fr')}
%div[@user, :greeting]
%img
%pre><
	foo
	bar
%img

-# Markup
%div
	<p id="blah">Blah!</p>

-# Inline Ruby
= ['hi', 'there', 'reader!'].join " "
- foo = "hello"
= link_to_remote "Add to cart",
		:url => { :action => "add", :id => product.id },
		:update => { :success => "cart", :failure => "error" }
~ "Foo\\n<pre>Bar\\nBaz</pre>"
%p
	- case 2
	- when 1
		= "1!"
	- when 2
		= "2?"
	- when 3
		= "3."
- (42...47).each do |i|
	%p= i
%p See, I can count!

-# Filters
%head
	:css
		#content: {
			background: url('img/background.jpg');
		}
		div {
			color: #333;
		}
	:javascript
		(function() {
			var test = "Do you like Prism?";
			if(confirm(test)) {
				do_something_great();
			}
		}());
%body

%script
	:coffee
		console.log 'This is coffee script'
`,
	handlebars: `{{! Comments }}
{{! This is a comment with <p>some markup</p> in it }}
{{! This is a comment }} {{ this_is_not }}

{{! Variables }}
<p>{{ text }}</p>
<h1>{{article.title}}</h1>
{{{ triple_stash_is_supported }}}
{{articles.[10].[#comments]}}

{{! Strings, numbers and booleans }}
{{{link "See more..." story.url}}}
{{ true }}
{{ custom_helper 42 href="somepage.html" false }}

{{! Block helpers }}
<div class="body">
	{{#bold}}{{body}}{{/bold}}
</div>
{{#with story}}
	<div class="intro">{{{intro}}}</div>
	<div class="body">{{{body}}}</div>
{{/with}}
<div class="{{#if test}}foo{{else}}bar{{/if}}"></div>
{{#list array}}
	{{@index}}. {{title}}
{{/list}}
{{#block-with-hyphens args=yep}}
	This should probably work...
{{/block-with-hyphens}}
`,
	haskell: `-- Comments
-- Single line comment
{- Multi-line
comment -}

-- Strings and characters
'a'
'\\n'
'\\^A'
'\\^]'
'\\NUL'
'\\23'
'\\o75'
'\\xFE'
"Here is a backslant \\\\ as well as \\137, \\
	\\a numeric escape character, and \\^X, a control character."

-- Numbers
42
123.456
123.456e-789
1e+3
0o74
0XAF

-- Full example
hGetLine h =
	wantReadableHandle_ "Data.ByteString.hGetLine" h $
		\\ h_@Handle__{haByteBuffer} -> do
			flushCharReadBuffer h_
			buf <- readIORef haByteBuffer
			if isEmptyBuffer buf
				then fill h_ buf 0 []
				else haveBuf h_ buf 0 []
where

	fill h_@Handle__{haByteBuffer,haDevice} buf len xss =
		len \`seq\` do
		(r,buf') <- Buffered.fillReadBuffer haDevice buf
		if r == 0
			then do writeIORef haByteBuffer buf{ bufR=0, bufL=0 }
				if len > 0
					then mkBigPS len xss
					else ioe_EOF
			else haveBuf h_ buf' len xss

	haveBuf h_@Handle__{haByteBuffer}
		buf@Buffer{ bufRaw=raw, bufR=w, bufL=r }
		len xss =
		do
			off <- findEOL r w raw
			let new_len = len + off - r
			xs <- mkPS raw r off

			-- if eol == True, then off is the offset of the '\\n'
			-- otherwise off == w and the buffer is now empty.
				if off /= w
					then do if (w == off + 1)
						then writeIORef haByteBuffer buf{ bufL=0, bufR=0 }
						else writeIORef haByteBuffer buf{ bufL = off + 1 }
							mkBigPS new_len (xs:xss)
					else do
						fill h_ buf{ bufL=0, bufR=0 } new_len (xs:xss)

	-- find the end-of-line character, if there is one
	findEOL r w raw
		| r == w = return w
		| otherwise =  do
			c <- readWord8Buf raw r
			if c == fromIntegral (ord '\\n')
				then return r -- NB. not r+1: don't include the '\\n'
				else findEOL (r+1) w raw

mkPS :: RawBuffer Word8 -> Int -> Int -> IO ByteString
mkPS buf start end =
	create len $ \\p ->
		withRawBuffer buf $ \\pbuf -> do
		copyBytes p (pbuf \`plusPtr\` start) len
	where
		len = end - start
`,
	haxe: `// Strings and string interpolation
"Foo
bar $baz"
'Foo
bar'
"\${4 + 2}"

// Regular expressions
~/haxe/i
~/[A-Z0-9._%-]+@[A-Z0-9.-]+.[A-Z][A-Z][A-Z]?/i
~/(dog|fox)/g

// Conditional compilation
#if !debug
	trace("ok");
#elseif (debug_level > 3)
	trace(3);
#else
	trace("debug level too low");
#end

// Metadata
@author("Nicolas")
@debug
class MyClass {
	@range(1, 8)
	var value:Int;

	@broken
	@:noCompletion
	static function method() { }
}

// Reification
macro static function add(e:Expr) {
	return macro $e + $e;
}
`,
	hcl: `# Comments
# Configure the AWS Provider
// Configure the AWS Provider

# Resources
resource "aws_instance" "web" {
	ami           = "\${data.aws_ami.ubuntu.id}"
	instance_type = "t2.micro"

	tags {
		Name = "HelloWorld"
	}
}

# Provider
provider "aws" {
	access_key = "\${var.aws_access_key}"
	secret_key = "\${var.aws_secret_key}"
	region     = "us-east-1"
}

# Variables
variable "images" {
	type = "map"

	default = {
		us-east-1 = "image-1234"
		us-west-2 = "image-4567"
	}
}

# Outputs
output "address" {
	value = "\${aws_instance.db.public_dns}"
}

# Modules
module "consul" {
	source  = "hashicorp/consul/aws"
	servers = 5
}
`,
	hlsl: `// Full example
// Source: https://github.com/mellinoe/veldrid/blob/d60e5a036add2123a15f0da02f1da65a80503d54/src/Veldrid.ImGui/Assets/HLSL/imgui-frag.hlsl

struct PS_INPUT
{
	float4 pos : SV_POSITION;
	float4 col : COLOR0;
	float2 uv  : TEXCOORD0;
};

Texture2D FontTexture : register(t0);
sampler FontSampler : register(s0);

float4 FS(PS_INPUT input) : SV_Target
{
	float4 out_col = input.col * FontTexture.Sample(FontSampler, input.uv);
	return out_col;
}
`,
	hoon: `:: Caesar cipher
|= [a=@ b=tape]
^- tape
?: (gth a 25)
$(a (sub a 26))
%+ turn b
|= c=@tD
?: &((gte c 'A') (lte c 'Z'))
=. c (add c a)
?. (gth c 'Z') c
(sub c 26)
?: &((gte c 'a') (lte c 'z'))
=. c (add c a)
?. (gth c 'z') c
(sub c 26)
c
`,
	hpkp: `Pin for one year with report-uri
pin-sha256="EpOpN/ahUF6jhWShDUdy+NvvtaGcu5F7qM6+x2mfkh4=";
max-age=31536000;
includeSubDomains;
report-uri="https://my-reports.com/submit"

Pin for a short time (considered unsafe)
pin-sha256="EpOpN/ahUF6jhWShDUdy+NvvtaGcu5F7qM6+x2mfkh4=";
max-age=123
`,
	hsts: `Policy with far-future max-age
max-age=31536000

Policy with near-future max-age, considered unsafe
max-age=123

Policy with extra directives
max-age=31536000; includeSubdomains; preload
`,
	http: `Request header
GET http://localhost:9999/foo.html HTTP/1.1
Accept-Language: fr,fr-fr;q=0.8,en-us;q=0.5,en;q=0.3
Accept-Encoding: gzip, deflate

Response header
HTTP/1.1 200 OK
Server: GitHub.com
Date: Mon, 22 Dec 2014 18:25:30 GMT
Content-Type: text/html; charset=utf-8

Response body highlighted based on Content-Type
HTTP/1.1 200 OK
Server: GitHub.com
Date: Mon, 22 Dec 2014 18:25:30 GMT
Content-Type: text/html; charset=utf-8
Last-Modified: Sun, 21 Dec 2014 20:29:48 GMT
Transfer-Encoding: chunked
Expires: Mon, 22 Dec 2014 18:35:30 GMT
Cache-Control: max-age=600
Vary: Accept-Encoding
Content-Encoding: gzip

<!DOCTYPE html>
<html lang="en">
<head></head>
<body></body>
</html>
`,
	ichigojam: `' Comments
' This is a comment
REM This is a remark
'NoSpaceIsOK
REMNOSPACE

' Strings
"This a string."
"This is a string with ""quotes"" in it."

' Numbers
42
3.14159
-42
-3.14159
.5
10.
2E10
4.2E-14
-3E+2
#496F726953756B69
\`11100010

' IchigoJam Basic example
A=0
FOR I=1 TO 100 : A=A+I : NEXT
PRINT A
`,
	icon: `# Comments
#
# Foobar

# Strings and csets
""
"Foo\\"bar"
''
'a\\'bcdefg'

# Numbers
42
3.14159
5.2E+8
16rface
2r1101

# Full example
# Author: Robert J. Alexander
global GameObject, Tree, Learn
record Question(question, yes, no)
procedure main()
	GameObject := "animal"
	Tree := Question("Does it live in water", "goldfish", "canary")
	Get()                                  # Recall prior knowledge
	Game()                                 # Play a game
	return
end
#  Game() -- Conducts a game.
#
procedure Game()
	while Confirm("Are you thinking of ", Article(GameObject), " ",
		GameObject) do Ask(Tree)
	write("Thanks for a great game.")
	if \\Learn &Confirm("Want to save knowledge learned this session")
	then Save()
	return
end
#  Confirm() -- Handles yes/no questions and answers.
#
procedure Confirm(q[])
	local answer, s
	static ok
	initial {
		ok := table()
		every ok["y" | "yes" | "yeah" | "uh huh"] := "yes"
		every ok["n" | "no"  | "nope" | "uh uh" ] := "no"
		}
	while /answer do {
		every writes(!q)
		write("?")
		case s := read() | exit(1) of {
			#  Commands recognized at a yes/no prompt.
			#
			"save":    Save()
			"get":     Get()
			"list":    List()
			"dump":    Output(Tree)
			default:   {
				(answer := \\ok[map(s, &ucase, &lcase)]) |
					write("This is a \\"yes\\" or \\"no\\" question.")
				}
			}
		}
	return answer == "yes"
end
#  Ask() -- Navigates through the barrage of questions leading to a
#  guess.
#
procedure Ask(node)
	local guess, question
	case type(node) of {
		"string":        {
			if not Confirm("It must be ", Article(node), " ", node, ", right") then {
				Learn := "yes"
				write("What were you thinking of?")
				guess := read() | exit(1)
				write("What question would distinguish ", Article(guess), " ",
					guess, " from ", Article(node), " ", node, "?")
				question := read() | exit(1)
				if question[-1] == "?" then question[-1] := ""
				question[1] := map(question[1], &lcase, &ucase)
				if Confirm("For ", Article(guess), " ", guess, ", what would the answer be")
				then return Question(question, guess, node)
			else return Question(question, node, guess)
			}
		}
		"Question":  {
			if Confirm(node.question) then node.yes := Ask(node.yes)
			else node.no := Ask(node.no)
			}
		}
end
#  Article() -- Come up with the appropriate indefinite article.
#
procedure Article(word)
	return if any('aeiouAEIOU', word) then "an" else "a"
end
#  Save() -- Store our acquired knowledge in a disk file name
#  based on the GameObject.
#
procedure Save()
	local f
	f := open(GameObject || "s", "w")
	Output(Tree, f)
	close(f)
	return
end
#  Output() -- Recursive procedure used to output the knowledge tree.
#
procedure Output(node, f, sense)
	static indent
	initial indent := 0
	/f := &output
	/sense := " "
	case type(node) of {
		"string":        write(f, repl(" ", indent), sense, "A: ", node)
		"Question":  {
			write(f, repl(" ", indent), sense, "Q: ", node.question)
			indent +:= 1
			Output(node.yes, f, "y")
			Output(node.no, f, "n")
			indent -:= 1
			}
		}
	return
end
#  Get() -- Read in a knowledge base from a file.
#
procedure Get()
	local f
	f := open(GameObject || "s", "r") | fail
	Tree := Input(f)
	close(f)
	return
end
#  Input() -- Recursive procedure used to input the knowledge tree.
#
procedure Input(f)
	local nodetype, s
	read(f) ? (tab(upto(~' \\t')) & =("y" | "n" | "") &
		nodetype := move(1) & move(2) & s := tab(0))
	return if nodetype == "Q" then Question(s, Input(f), Input(f)) else s
end
#  List() -- Lists the objects in the knowledge base.
#
$define Length           78
procedure List()
	local lst, line, item
	lst := Show(Tree, [ ])
	line := ""
	every item := !sort(lst) do {
		if *line + *item > Length then {
			write(trim(line))
			line := ""
			}
		line ||:= item || ", "
		}
	write(line[1:-2])
	return
end
#
#  Show() -- Recursive procedure used to navigate the knowledge tree.
#
procedure Show(node, lst)
	if type(node) == "Question" then {
		lst := Show(node.yes, lst)
		lst := Show(node.no, lst)
		}
	else put(lst, node)
	return lst
end
`,
	"icu-message-format": `Full example
https://unicode-org.github.io/icu/userguide/format_parse/messages/

{gender_of_host, select,
	female {
		{num_guests, plural, offset:1
			=0 {{host} does not give a party.}
			=1 {{host} invites {guest} to her party.}
			=2 {{host} invites {guest} and one other person to her party.}
			other {{host} invites {guest} and # other people to her party.}}}
	male {
		{num_guests, plural, offset:1
			=0 {{host} does not give a party.}
			=1 {{host} invites {guest} to his party.}
			=2 {{host} invites {guest} and one other person to his party.}
			other {{host} invites {guest} and # other people to his party.}}}
	other {
		{num_guests, plural, offset:1
			=0 {{host} does not give a party.}
			=1 {{host} invites {guest} to their party.}
			=2 {{host} invites {guest} and one other person to their party.}
			other {{host} invites {guest} and # other people to their party.}}}}
`,
	iecst: `// Code
CONFIGURATION DefaultCfg
	VAR_GLOBAL
		Start_Stop AT %IX0.0: BOOL; (* This is a comment *)
	END_VAR
	TASK NewTask  (INTERVAL := T#20ms);
	PROGRAM Main WITH NewTask : PLC_PRG;
END_CONFIGURATION
	
PROGRAM demo
	VAR_EXTERNAL
		Start_Stop: BOOL;
		StringVar: STRING[250] := "Test String"
	END_VAR
	VAR
		a : REAL; // Another comment
		todTest: TIME_OF_DAY := TOD#12:55;
	END_VAR
	a := csq(12.5);
	IF a > REAL#100 - 16#FAC0 + 2#1001_0110 THEN
		Start_Stop := TRUE;
	END_IF
END_PROGRAM;
	
FUNCTION_BLOCK PRIVATE MyName EXTENDS AnotherName
			
END_FUNCTION_BLOCK

/* Get a square of the circle */
FUNCTION csq : REAL 
	VAR_INPUT
		r: REAL;
	END_VAR
	VAR CONSTANT
		c_pi: REAL := 3.14;
	END_VAR
	csq := ABS(c_pi * (r * 2));
END_FUNCTION
`,
	idris: `-- Comments
-- Single line comment
{- Multi-line
comment -}

-- Strings and characters
'a'
'\\n'
'\\^A'
'\\^]'
'\\NUL'
'\\23'
'\\o75'
'\\xFE'

-- Numbers
42
123.456
123.456e-789
1e+3
0o74
0XAF

-- Larger example
module Main

import Data.Vect

-- this is comment
record Person where
	constructor MkPerson2
	age : Integer
	name : String

||| identity function
id : a -> a
id x = x

{-
Bool type can be defined in
userland
-}
data Bool = True | False

implementation Show Bool where
	show True = "True"
	show False = "False"

not : Bool -> Bool
not b = case b of
					True  => False
					False => True

vect3 : Vect 3 Int
vect3 = with Vect (1 :: 2 :: 3 :: Nil)
`,
	ignore: `# Comment
# This is a comment

# Entry
file[1-3].txt
.configs/**
!.configs/shared.cfg
`,
	inform7: `[ Comments ]
[This is a comment]
[This is a
multi-line comment]

[ Texts ]
"This is a string"
"This is a
multi-line string"

[ Numbers ]
42
3.14159
50kg
100m
one
three
twelve

[ Titles ]
Section 2 - Flamsteed's Balloon

Part SR1 - The Physical World Model

Table of Floors

[ Standard kinds, verbs and keywords ]
In the Treehouse is a container called the cardboard box.
The cardboard box is a closed container. The glass bottle is a transparent open container. The box is fixed in place and openable.

Check photographing:
	if the noun is the camera, say "Sadly impossible." instead.

[ Text substitution ]
"[if the player is in Center Ring]A magician's booth stands in the corner, painted dark blue with glittering gold stars.[otherwise if the magician's booth is closed]A crack of light indicates the way back out to the center ring.[otherwise]The door stands open to the outside.[end if]".

[ Full example ]
"Lakeside Living"

A volume is a kind of value. 15.9 fl oz specifies a volume with parts ounces and tenths (optional, preamble optional).

A fluid container is a kind of container. A fluid container has a volume called a fluid capacity. A fluid container has a volume called current volume.

The fluid capacity of a fluid container is usually 12.0 fl oz. The current volume of a fluid container is usually 0.0 fl oz.

Liquid is a kind of value. The liquids are water, absinthe, and iced tea. A fluid container has a liquid.

Instead of examining a fluid container:
	if the noun is empty,
		say "You catch just a hint of [the liquid of the noun] at the bottom.";
	otherwise
		say "[The noun] contains [current volume of the noun in rough terms] of [liquid of the noun]."

To say (amount - a volume) in rough terms:
	if the amount is less than 0.5 fl oz:
		say "a swallow or two";
	otherwise if tenths part of amount is greater than 3 and tenths part of amount is less than 7:
		let estimate be ounces part of amount;
		say "[estimate in words] or [estimate plus 1 in words] fluid ounces";
	otherwise:
		if tenths part of amount is greater than 6, increase amount by 1.0 fl oz;
		say "about [ounces part of amount in words] fluid ounce[s]".

Before printing the name of a fluid container (called the target) while not drinking or pouring:
	if the target is empty:
		say "empty ";
	otherwise:
		do nothing.

After printing the name of a fluid container (called the target) while not examining or pouring:
	unless the target is empty:
		say " of [liquid of the target]";
		omit contents in listing.

Instead of inserting something into a fluid container:
	say "[The second noun] has too narrow a mouth to accept anything but liquids."

Definition: a fluid container is empty if the current volume of it is 0.0 fl oz. Definition: a fluid container is full if the current volume of it is the fluid capacity of it.

Understand "drink from [fluid container]" as drinking.

Instead of drinking a fluid container:
	if the noun is empty:
		say "There is no more [liquid of the noun] within." instead;
	otherwise:
		decrease the current volume of the noun by 0.2 fl oz;
		if the current volume of the noun is less than 0.0 fl oz, now the current volume of the noun is 0.0 fl oz;
		say "You take a sip of [the liquid of the noun][if the noun is empty], leaving [the noun] empty[end if]."

Part 2 - Filling

Understand the command "fill" as something new.

Understand "fill [fluid container] with/from [full liquid source]" as filling it with. Understand "fill [fluid container] with/from [fluid container]" as filling it with.

Understand "fill [something] with/from [something]" as filling it with.

Filling it with is an action applying to two things. Carry out filling it with: try pouring the second noun into the noun instead.

Understand "pour [fluid container] in/into/on/onto [fluid container]" as pouring it into. Understand "empty [fluid container] into [fluid container]" as pouring it into.

Understand "pour [something] in/into/on/onto [something]" as pouring it into. Understand "empty [something] into [something]" as pouring it into.

Pouring it into is an action applying to two things.

Check pouring it into:
	if the noun is not a fluid container, say "You can't pour [the noun]." instead;
	if the second noun is not a fluid container, say "You can't pour liquids into [the second noun]." instead;
	if the noun is the second noun, say "You can hardly pour [the noun] into itself." instead;
	if the liquid of the noun is not the liquid of the second noun:
		if the second noun is empty, now the liquid of the second noun is the liquid of the noun;
		otherwise say "Mixing [the liquid of the noun] with [the liquid of the second noun] would give unsavory results." instead;
	if the noun is empty, say "No more [liquid of the noun] remains in [the noun]." instead;
	if the second noun is full, say "[The second noun] cannot contain any more than it already holds." instead.

Carry out pouring it into:
	let available capacity be the fluid capacity of the second noun minus the current volume of the second noun;
	if the available capacity is greater than the current volume of the noun, now the available capacity is the current volume of the noun;
	increase the current volume of the second noun by available capacity;
	decrease the current volume of the noun by available capacity.

Report pouring it into:
	say "[if the noun is empty][The noun] is now empty;[otherwise][The noun] now contains [current volume of the noun in rough terms] of [liquid of the noun]; [end if]";
	say "[the second noun] contains [current volume of the second noun in rough terms] of [liquid of the second noun][if the second noun is full], and is now full[end if]."

Understand the liquid property as describing a fluid container. Understand "of" as a fluid container.

A liquid source is a kind of fluid container. A liquid source has a liquid. A liquid source is usually scenery. The fluid capacity of a liquid source is usually 3276.7 fl oz. The current volume of a liquid source is usually 3276.7 fl oz. Instead of examining a liquid source: say "[The noun] is full of [liquid of the noun]."

Carry out pouring a liquid source into something: now the current volume of the noun is 3276.7 fl oz.

After pouring a liquid source into a fluid container:
	say "You fill [the second noun] up with [liquid of the noun] from [the noun]."

Instead of pouring a fluid container into a liquid source:
	if the noun is empty, say "[The noun] is already empty." instead;
	now the current volume of the noun is 0.0 fl oz;
	say "You dump out [the noun] into [the second noun]."

Swimming is an action applying to nothing. Understand "swim" or "dive" as swimming.

Instead of swimming in the presence of a liquid source:
	say "You don't feel like a dip just now."

Before inserting something into a liquid source: say "[The noun] would get lost and never be seen again." instead.

Part 3 - Scenario

The Lakeside is a room. The Lakeside swing is an enterable supporter in the Lakeside. "Here you are by the lake, enjoying a summery view."

The glass is a fluid container carried by the player. The liquid of the glass is absinthe. The current volume of the glass is 0.8 fl oz.

The pitcher is a fluid container in the Lakeside. The fluid capacity of the pitcher is 32.0 fl oz. The current volume of the pitcher is 20.0 fl oz. The liquid of the pitcher is absinthe.

The lake is a liquid source. It is in the Lakeside.

The player wears a bathing outfit. The description of the bathing outfit is "Stylishly striped in blue and white, and daringly cut to reveal almost all of your calves, and quite a bit of upper arm, as well. You had a moral struggle, purchasing it; but mercifully the lakeshore is sufficiently secluded that no one can see you in this immodest apparel."

Instead of taking off the outfit: say "What odd ideas come into your head sometimes!"

Test me with "fill glass / empty absinthe into lake / fill glass / swim / drink lake / drink / x water / x lake".
`,
	ini: `; Comments
; This is a comment

; Section title
[owner]
[database]

; Properties
name=prism
file="somefile.txt"
`,
	io: `// Comments
//
// Foobar
#!/usr/bin/env io
/* multiline
comment
*/

// Strings
"this is a \\"test\\".\\nThis is only a test."
"""this is a "test".
This is only a test."""

// Numbers
123
123.456
0.456
123e-4
123e4
123.456e-7
123.456e2

// Full example
"Hello, world!" println
A := Object clone    // creates a new, empty object named "A"
factorial := method(n,
	if(n == 0, return 1)
	res := 1
	Range 1 to(n) foreach(i, res = res * i)
)
`,
	java: `// Javadoc
/**
 * Returns the value to which the specified key is mapped,
 * or {@code null} if this map contains no mapping for the key.
 *
 * <p>More formally, if this map contains a mapping from a key
 * {@code k} to a value {@code v} such that {@code (key==null ? k==null :
 * key.equals(k))}, then this method returns {@code v}; otherwise
 * it returns {@code null}.  (There can be at most one such mapping.)
 *
 * <p>If this map permits null values, then a return value of
 * {@code null} does not <i>necessarily</i> indicate that the map
 * contains no mapping for the key; it's also possible that the map
 * explicitly maps the key to {@code null}.  The {@link #containsKey
 * containsKey} operation may be used to distinguish these two cases.
 *
 * @param key the key whose associated value is to be returned
 * @return the value to which the specified key is mapped, or
 *         {@code null} if this map contains no mapping for the key
 * @throws ClassCastException if the key is of an inappropriate type for
 *         this map
 * (<a href="{@docRoot}/java/util/Collection.html#optional-restrictions">optional</a>)
 * @throws NullPointerException if the specified key is null and this map
 *         does not permit null keys
 * (<a href="{@docRoot}/java/util/Collection.html#optional-restrictions">optional</a>)
 */
V get(Object key);

// Source: Java 1.8, Map#get(Object)

// Comments
// Single line comment
/* Multi-line
comment */

// Strings
"foo \\"bar\\" baz";
'foo \\'bar\\' baz';

// Numbers
123
123.456
-123.456
.3f
1.3e9d
0xaf
0xAF
0xFF.AEP-4

// Full example
import java.util.Scanner;

public class Life {

	@Override @Bind("One")
	public void show(boolean[][] grid) {
		String s = "";
		for (boolean[] row : grid) {
			for (boolean val : row)
				if(val)
					s += "*";
				else
					s += ".";
			s += "\\n";
		}
		System.out.println(s);
	}

	public static boolean[][] gen() {
		boolean[][] grid = new boolean[10][10];
		for (int r = 0; r < 10; r++)
			for (int c = 0; c < 10; c++)
				if ( Math.random() > 0.7 )
					grid[r][c] = true;
		return grid;
	}

	public static void main(String[] args) {
		boolean[][] world = gen();
		show(world);
		System.out.println();
		world = nextGen(world);
		show(world);
		Scanner s = new Scanner(System.in);
		while (s.nextLine().length() == 0) {
			System.out.println();
			world = nextGen(world);
			show(world);
		}
	}

	// [...]
}
`,
	j: `NB. Comments
NB. This is a comment

NB. Strings
'This is a string.'
'This is a string with ''quotes'' in it.'

NB. Numbers
2.3e2 2.3e_2 2j3
2p1 1p_1
1x2 2x1 1x_1
2e2j_2e2 2e2j2p1 2ad45 2ar0.785398
16b1f 10b23 _10b23 1e2b23 2b111.111

NB. Verbs
%4
3%4
,b
'I';'was';'here'
3 5$'wake read lamp '

NB. Adverbs
1 2 3 */ 4 5 6 7
'%*'(1 3;2 _1)} y

NB. Conjunctions
10&^. 2 3 10 100 200
+\`*
+:@*: +/ -:@%:

NB. Examples
NB. The following functions E1, E2 and E3
NB. interchange two rows of a matrix,
NB. multiply a row by a constant,
NB. and add a multiple of one row to another:

E1=: <@] C. [
E2=: f\`g\`[}
E3=: F\`g\`[}
f=: {:@] * {.@] { [
F=: [: +/ (1:,{:@]) * (}:@] { [)
g=: {.@]
M=: i. 4 5
M;(M E1 1 3);(M E2 1 10);(M E3 1 3 10)

NB. Implementation of quicksort

sel=: adverb def 'u # ['

quicksort=: verb define
	if. 1 >: #y do. y
	else.
		(quicksort y <sel e),(y =sel e),quicksort y >sel e=.y{~?#y
	end.
)

NB. Implementation of quicksort (tacit programming)

quicksort=: (($:@(<#[), (=#[), $:@(>#[)) ({~ ?@#)) ^: (1<#)
`,
	javascript: `// Variable assignment
var foo = "bar", baz = 5;

// Operators
(1 + 2 * 3)/4 >= 3 && 4 < 5 || 6 > 7

// Indented code
if (true) {
	while (true) {
		doSomething();
	}
}

// Regex with slashes
var foo = /([^/])\\/(\\\\?.|\\[.+?])+?\\/[gim]{0,3}/g;

// Regex that ends with double slash
var bar = /\\/\\*[\\w\\W]*?\\*\\//g;

// Single line comments & regexes
// http://lea.verou.me
var comment = /\\/\\*[\\w\\W]*?\\*\\//g;

// Link in comment
// http://lea.verou.me
/* http://lea.verou.me */

// Nested strings
var foo = "foo", bar = "He \\"said\\" 'hi'!"

// Strings inside comments
// "foo"
/* "foo" */

// Strings with slashes
env.content + '</' + env.tag + '>'
var foo = "/" + "/";
var foo = "http://prismjs.com"; // Strings are strings and comments are comments ;)

// Regex inside single line comment
// hey, /this doesn’t fail!/ :D

// Two or more division operators on the same line
var foo = 5 / 6 / 7;

// A division operator on the same line as a regex
var foo = 1/2, bar = /a/g;
var foo = /a/, bar = 3/4;

// ES6 features
// Regex "y" and "u" flags
var a = /[a-zA-Z]+/gimyu;

// for..of loops
for(let x of y) { }

// Modules: import
import { foo as bar } from "file.js"

// Template strings
\`Only on \${y} one line\`
\`This template string \${x} is on

multiple lines.\`
\`40 + 2 = \${ 40 + 2 }\`
\`The squares of the first 3 natural integers are \${[for (x of [1,2,3]) x*x].join(', ')}\`

// JSDoc
/**
 * @typedef {object} Foo
 * @property {string} bar
 * @memberof Baz
 */

/**
 * Trims the given string.
 *
 * @param {string} [str=""] the string.
 * @returns {string} the trimmed string.
 * @throws {TypeError} if the argument is not a string.
 * @example trim(" hello ")
 */
function trim(str = "") {
	if (typeof str != "string") {
		throw new TypeError("str has to be a string");
	}
	return str.trim();
}

// HTML template literals
html\`
<p>
	Foo.
</p>\`;

// JS DOM
div.innerHTML = \`<p></p>\`;
div.outerHTML = \`<p></p>\`;

// <a href="https://github.com/zeit/styled-jsx">styled-jsx</a> CSS template literals
css\`a:hover { color: blue; }\`;

// <a href="https://github.com/styled-components/styled-components"><code class="language-none">styled-components</code></a> CSS template literals
const Button = styled.button\`
	color: blue;
	background: red;
\`;

// Markdown template literals
markdown\`# My title\`;

// GraphQL template literals
gql\`{ foo }\`;
graphql\`{ foo }\`;

// Regex
var entity = [
	{
		pattern: /&[a-z\\d]{1,8};/i,
		alias: 'named-entity'
	},
	/&#x?[a-f\\d]{1,8};/i
];

var tag = {
	pattern: /<\\/?(?!\\d)[^\\s/=>$<%]+(?:\\s(?:\\s*[^\\s/=>]+(?:\\s*=\\s*(?!\\s)(?:"[^"]*"|'[^']*'|[^\\s"'=>]+(?=[\\s>]))?|(?=[\\s/>])))+)?\\s*\\/?>/g,
	greedy: true,
	inside: {
		'punctuation': /^<\\/?|\\/?>$/,
		'tag': {
			pattern: /^\\S+/,
			inside: {
				'namespace': /^[^:]+:/
			}
		},
		'attr-value': {
			pattern: /(=\\s*)(?:"[^"]*"|'[^']*'|[^\\s"'=>]+)/g,
			lookbehind: true,
			greedy: true,
			inside: {
				'punctuation': /^["']|["']$/,
				entity
			}
		},
		'attr-equals': /=/,
		'attr-name': {
			pattern: /\\S+/,
			inside: {
				'namespace': /^[^:]+:/
			}
		}
	}
};
`,
	javastacktrace: `Full example
javax.servlet.ServletException: Something bad happened
	at com.example.myproject.OpenSessionInViewFilter.doFilter(OpenSessionInViewFilter.java:60)
	at org.mortbay.jetty.servlet.ServletHandler$CachedChain.doFilter(ServletHandler.java:1157)
	at com.example.myproject.ExceptionHandlerFilter.doFilter(ExceptionHandlerFilter.java:28)
	at org.mortbay.jetty.servlet.ServletHandler$CachedChain.doFilter(ServletHandler.java:1157)
	at com.example.myproject.OutputBufferFilter.doFilter(OutputBufferFilter.java:33)
	at org.mortbay.jetty.servlet.ServletHandler$CachedChain.doFilter(ServletHandler.java:1157)
	at org.mortbay.jetty.servlet.ServletHandler.handle(ServletHandler.java:388)
	at org.mortbay.jetty.security.SecurityHandler.handle(SecurityHandler.java:216)
	at org.mortbay.jetty.servlet.SessionHandler.handle(SessionHandler.java:182)
	at org.mortbay.jetty.handler.ContextHandler.handle(ContextHandler.java:765)
	at org.mortbay.jetty.webapp.WebAppContext.handle(WebAppContext.java:418)
	at org.mortbay.jetty.handler.HandlerWrapper.handle(HandlerWrapper.java:152)
	at org.mortbay.jetty.Server.handle(Server.java:326)
	at org.mortbay.jetty.HttpConnection.handleRequest(HttpConnection.java:542)
	at org.mortbay.jetty.HttpConnection$RequestHandler.content(HttpConnection.java:943)
	at org.mortbay.jetty.HttpParser.parseNext(HttpParser.java:756)
	at org.mortbay.jetty.HttpParser.parseAvailable(HttpParser.java:218)
	at org.mortbay.jetty.HttpConnection.handle(HttpConnection.java:404)
	at org.mortbay.jetty.bio.SocketConnector$Connection.run(SocketConnector.java:228)
	at org.mortbay.thread.QueuedThreadPool$PoolThread.run(QueuedThreadPool.java:582)
Caused by: com.example.myproject.MyProjectServletException
	at com.example.myproject.MyServlet.doPost(MyServlet.java:169)
	at javax.servlet.http.HttpServlet.service(HttpServlet.java:727)
	at javax.servlet.http.HttpServlet.service(HttpServlet.java:820)
	at org.mortbay.jetty.servlet.ServletHolder.handle(ServletHolder.java:511)
	at org.mortbay.jetty.servlet.ServletHandler$CachedChain.doFilter(ServletHandler.java:1166)
	at com.example.myproject.OpenSessionInViewFilter.doFilter(OpenSessionInViewFilter.java:30)
	... 27 more
Suppressed: org.hibernate.exception.ConstraintViolationException: could not insert: [com.example.myproject.MyEntity]
	at org.hibernate.exception.SQLStateConverter.convert(SQLStateConverter.java:96)
	at org.hibernate.exception.JDBCExceptionHelper.convert(JDBCExceptionHelper.java:66)
	at org.hibernate.id.insert.AbstractSelectingDelegate.performInsert(AbstractSelectingDelegate.java:64)
	at org.hibernate.persister.entity.AbstractEntityPersister.insert(AbstractEntityPersister.java:2329)
	at org.hibernate.persister.entity.AbstractEntityPersister.insert(AbstractEntityPersister.java:2822)
	at org.hibernate.action.EntityIdentityInsertAction.execute(EntityIdentityInsertAction.java:71)
	at org.hibernate.engine.ActionQueue.execute(ActionQueue.java:268)
	at org.hibernate.event.def.AbstractSaveEventListener.performSaveOrReplicate(AbstractSaveEventListener.java:321)
	at org.hibernate.event.def.AbstractSaveEventListener.performSave(AbstractSaveEventListener.java:204)
	at org.hibernate.event.def.AbstractSaveEventListener.saveWithGeneratedId(AbstractSaveEventListener.java:130)
	at org.hibernate.event.def.DefaultSaveOrUpdateEventListener.saveWithGeneratedOrRequestedId(DefaultSaveOrUpdateEventListener.java:210)
	at org.hibernate.event.def.DefaultSaveEventListener.saveWithGeneratedOrRequestedId(DefaultSaveEventListener.java:56)
	at org.hibernate.event.def.DefaultSaveOrUpdateEventListener.entityIsTransient(DefaultSaveOrUpdateEventListener.java:195)
	at org.hibernate.event.def.DefaultSaveEventListener.performSaveOrUpdate(DefaultSaveEventListener.java:50)
	at org.hibernate.event.def.DefaultSaveOrUpdateEventListener.onSaveOrUpdate(DefaultSaveOrUpdateEventListener.java:93)
	at org.hibernate.impl.SessionImpl.fireSave(SessionImpl.java:705)
	at org.hibernate.impl.SessionImpl.save(SessionImpl.java:693)
	at org.hibernate.impl.SessionImpl.save(SessionImpl.java:689)
	at sun.reflect.GeneratedMethodAccessor5.invoke(Unknown Source)
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:25)
	at java.lang.reflect.Method.invoke(Method.java:597)
	at org.hibernate.context.ThreadLocalSessionContext$TransactionProtectionWrapper.invoke(ThreadLocalSessionContext.java:344)
	at $Proxy19.save(Unknown Source)
	at com.example.myproject.MyEntityService.save(MyEntityService.java:59) <-- relevant call (see notes below)
	at com.example.myproject.MyServlet.doPost(MyServlet.java:164)
	... 32 more
Caused by: java.sql.SQLException: Violation of unique constraint MY_ENTITY_UK_1: duplicate value(s) for column(s) MY_COLUMN in statement [...]
	at org.hsqldb.jdbc.Util.throwError(Unknown Source)
	at org.hsqldb.jdbc.jdbcPreparedStatement.executeUpdate(Unknown Source)
	at com.mchange.v2.c3p0.impl.NewProxyPreparedStatement.executeUpdate(NewProxyPreparedStatement.java:105)
	at org.hibernate.id.insert.AbstractSelectingDelegate.performInsert(AbstractSelectingDelegate.java:57)
	... 54 more
`,
	jexl: `Full example
[
	fun(1,2),
	{ obj: "1" }.obj,
	ctx|transform
]|join(", ")
`,
	jolie: `// Comments
// Single line comment
/* Multi-line
comment */

// Strings
"foo \\"bar\\" baz";
'foo \\'bar\\' baz'

// Numbers
42
42L
1.2e3
0.1E-4
0.2e+1

// Full example
include "console.iol"

type HubType: void {
	.sid: undefined
	.nodes[1,*] : NodeType
}

type NodeType: void {
	.sid: string
	.node: string
	.load?: int
}

type NetType: HubType | NodeType

interface NetInterface {
	OneWay: start( string ), addElement( NetType ), removeElement( NetType ), quit( void )
	RequestResponse: showElements( void )( NetType ) throws SomeFault
}

type LogType: void {
	.message: string
}

interface LoggerInterface {
	RequestResponse: log( LogType )( void )
}

outputPort LoggerService {
	Interfaces: LoggerInterface
}

embedded {
	Jolie: "logger.ol" in LoggerService
}

type AuthenticationData: void {
	.key:string
}

interface extender AuthInterfaceExtender {
	OneWay: *(AuthenticationData)
}

service SubService
{
	Interfaces: NetInterface

	main
	{
		println@Console( "I do nothing" )()
	}
}

inputPort ExtLogger {
	Location: "socket://localhost:9000"
	Protocol: sodep
	Interfaces: LoggerInterface
	Aggregates: LoggerService with AuthInterfaceExtender
}

courier ExtLogger {
	[interface LoggerInterface( request )] {
		if ( key == "secret" ){
			forward ( request )
		}
	}
}

inputPort In {
	Location: "socket://localhost:8000"
	Protocol: http {
		.debug = true;
		.debug.showContent = true
	}
	Interfaces: NetInterface
	Aggregates: SubService,
							LoggerService
	Redirects: A => SubService,
						 B => SubService
}

cset {
	sid: HubType.sid NodeType.sid
}

execution{ concurrent }

define netmodule {
	if( request.load == 0 || request.load < 1 &&
			request.load <= 2 || request.load >= 3 &&
			request.load > 4  || request.load%4 == 2
	) {
		scope( scopeName ) {
			// inline comment
			install( MyFault => println@Console( "Something \\"Went\\" Wrong" + ' but it\\'s ok' )() );
			/*
			* Multi-line
			* Comment
			*/
			install( this => cH; println@Console( "Something went wrong: " + ^load )() );
			install( default => comp( scopeName ); println@Console( "Something went wrong" )() );
			load -> request.( "load" );
			{ ++load | load++ | --load | load-- };
			throw( MyFault )
		}
	} else {
		foreach ( node -> request.nodes ) {
			with( node ){
				while( .load != 100 ) {
					.load++
				}
			}
		}
	}
}

main
{
	start( sid );
	synchronized( unneededSync ){
		csets.sid = sid;
		undef( sid )
	};
	provide
		[ addElement( request ) ]{
			if( request instanceof NodeType ) {
				netmodule
			}
		}
		[ removeElement() ]
		[ showElements()( response ){
			/*
			 * assemble response
			 */
			nullProcess
		}]{
			// log the request
			log@LoggerService( new )();
			log @ LoggerService( new )()
		}
	until
	[ quit() ]{ exit }
}
`,
	jq: `# Full example
# comment
def some_method:
	to_entries | sort_by(.foo) |
	map(.foo) as $keys |
	map(.bar) | transpose |
	map(
		[$keys, .] | transpose |
		map({foo: .[0], bar: .[1], "foo-bar": "foo\\("-" + "bar")"}) | from_entries
	)
;
`,
	json: `// Full example
{
	"data": {
		"labels": [
			"foo",
			"bar"
		],
		"series": [
			[ 0, 1, 2, 3 ],
			[ 0, -4, -8, -12 ]
		]
	},
	// we even support comments
	"error": null,
	"status": "Ok"
}
`,
	json5: `// Full example
{
	// comments
	unquoted: 'and you can quote me on that',
	singleQuotes: 'I can use "double quotes" here',
	lineBreaks: "Look, Mom! \\
No \\\\n's!",
	hexadecimal: 0xdecaf,
	leadingDecimalPoint: .8675309, andTrailing: 8675309.,
	positiveSign: +1,
	trailingComma: 'in objects', andIn: ['arrays',],
	"backwardsCompatible": "with JSON",
}
`,
	jsstacktrace: `Full example
(node:40780) DeprecationWarning: Using Buffer without \`new\` will soon stop working. Use \`new Buffer()\`, or preferably \`Buffer.from()\`, \`Buffer.allocUnsafe()\` or \`Buffer.alloc()\` instead.
	at Buffer (buffer.js:79:13)
	at repl:1:1
	at sigintHandlersWrap (vm.js:22:35)
	at sigintHandlersWrap (vm.js:96:12)
	at ContextifyScript.Script.runInThisContext (vm.js:21:12)
	at REPLServer.defaultEval (repl.js:313:29)
	at bound (domain.js:280:14)
	at REPLServer.runBound [as eval] (domain.js:293:12)
	at REPLServer.onLine (repl.js:513:10)
	at emitOne (events.js:101:20)

Error: custom error
	at Server.<anonymous> (/trace/showcases/http.js:4:9)
	at emitTwo (events.js:106:13)
	at Server.emit (events.js:191:7)
	at HTTPParser.parserOnIncoming [as onIncoming] (_http_server.js:543:12)
	at HTTPParser.parserOnHeadersComplete (_http_common.js:105:23)
	at new <anonymous> (_http_common.js:159:16)
	at exports.FreeList.alloc (internal/freelist.js:14:46)
	at Server.connectionListener (_http_server.js:316:24)
	at emitOne (events.js:96:13)
	at Server.emit (events.js:188:7)
	at TCP.onconnection (net.js:1460:8)
	at createServerHandle (net.js:1181:14)
	at Server._listen2 (net.js:1225:14)
	at listen (net.js:1290:10)
	at Server.listen (net.js:1386:5)
	at Object.<anonymous> (/trace/showcases/http.js:5:4)
	at Module._compile (module.js:541:32)
	at Object.Module._extensions..js (module.js:550:10)
	at Module.load (module.js:458:32)
	at tryModuleLoad (module.js:417:12)
	at Function.Module._load (module.js:409:3)
	at Module.runMain (module.js:575:10)
	at run (bootstrap_node.js:340:7)
	at startup (bootstrap_node.js:132:9)
	at bootstrap_node.js:455:3


Error: custom error
	at /trace/showcases/basic.js:7:13
	at _combinedTickCallback (internal/process/next_tick.js:67:7)
	at process._tickCallback (internal/process/next_tick.js:98:9)
	at InternalFieldObject.ondone (/trace/showcases/basic.js:6:13)
	at /trace/showcases/basic.js:5:10
	at FSReqWrap.readFileAfterClose [as oncomplete] (fs.js:445:3)
	at ReadFileContext.close (fs.js:358:11)
	at FSReqWrap.readFileAfterRead [as oncomplete] (fs.js:414:15)
	at ReadFileContext.read (fs.js:342:11)
	at FSReqWrap.readFileAfterStat [as oncomplete] (fs.js:398:11)
	at FSReqWrap.readFileAfterOpen [as oncomplete] (fs.js:374:11)
	at Object.fs.readFile (fs.js:303:11)
	at Object.<anonymous> (/trace/showcases/basic.js:4:4)
	at Module._compile (module.js:541:32)
	at Object.Module._extensions..js (module.js:550:10)
	at Module.load (module.js:458:32)
	at tryModuleLoad (module.js:417:12)
	at Function.Module._load (module.js:409:3)
	at Module.runMain (module.js:575:10)
	at run (bootstrap_node.js:340:7)
	at startup (bootstrap_node.js:132:9)
	at bootstrap_node.js:455:3


BulkWriteError: E11000 duplicate key error collection: test.test index: _id_ dup key: { : 1 }
	at OrderedBulkOperation.handleWriteError (/workspace/node_modules/mongodb/lib/bulk/common.js:1048:11)
	at resultHandler (/workspace/node_modules/mongodb/lib/bulk/ordered.js:159:23)
	at /workspace/node_modules/mongodb/node_modules/mongodb-core/lib/connection/pool.js:532:18
	at _combinedTickCallback (internal/process/next_tick.js:131:7)
	at process._tickCallback (internal/process/next_tick.js:180:9)

Error
	at Collection.(anonymous function) [as insertMany] (/workspace/node_modules/monogram/lib/collection.js:80:21)
	at insert (/workspace/test.js:14:31)
	at run (/workspace/test.js:9:9)
	at <anonymous>
	at process._tickCallback (internal/process/next_tick.js:188:7)

Error
	at Collection.(anonymous function) [as insertMany] (/workspace/node_modules/monogram/lib/collection.js:80:21)
	at insert (/workspace/test.js:15:31)
	at processTicksAndRejections (internal/process/next_tick.js:81:5)


Deno:

Error: Some error
	at throwsA (<unknown>:1:23)
	at <unknown>:1:13
	at evaluate ($deno$/repl.ts:64:34)
	at Object.replLoop ($deno$/repl.ts:153:13)

Uncaught NotFound: No such file or directory (os error 2)
	at DenoError (deno/js/errors.ts:22:5)
	at maybeError (deno/js/errors.ts:41:12)
	at handleAsyncMsgFromRust (deno/js/dispatch.ts:27:17)
`,
	jsonp: `// Callbacks
callback({ "data": null });
`,
	jsx: `// Full example
var ExampleApplication = React.createClass({
	render: function() {
		var elapsed = Math.round(this.props.elapsed  / 100);
		var seconds = elapsed / 10 + (elapsed % 10 ? '' : '.0' );
		var message =
			'React has been successfully running for ' + seconds + ' seconds.';

		return <p>{message}</p>;
	}
});
var start = new Date().getTime();
setInterval(function() {
	React.render(
		<ExampleApplication elapsed={new Date().getTime() - start} />,
		document.getElementById('container')
	);
}, 50);
`,
	julia: `# Full example
function mandel(z)
	c = z
	maxiter = 80
	for n = 1:maxiter
		if abs(z) > 2
			return n-1
		end
		z = z^2 + c
	end
	return maxiter
end

function randmatstat(t)
	n = 5
	v = zeros(t)
	w = zeros(t)
	for i = 1:t
		a = randn(n,n)
		b = randn(n,n)
		c = randn(n,n)
		d = randn(n,n)
		P = [a b c d]
		Q = [a b; c d]
		v[i] = trace((P.'*P)^4)
		w[i] = trace((Q.'*Q)^4)
	end
	std(v)/mean(v), std(w)/mean(w)
end
`,
	keepalived: `# A example from keepalived document
# Configuration File for keepalived
global_defs {
	notification_email {
		admin@domain.com
		0633225522@domain.com
	}
	notification_email_from keepalived@domain.com
	smtp_server 192.168.200.20
	smtp_connect_timeout 30
	router_id LVS_MAIN
}

# VRRP Instances definitions
vrrp_instance VI_1 {
	state MASTER
	interface eth0
	virtual_router_id 51
	priority 150
	advert_int 1
	authentication {
		auth_type PASS
		auth_pass k@l!ve1
	}
	virtual_ipaddress {
		192.168.200.10
		192.168.200.11
	}
}
vrrp_instance VI_2 {
	state MASTER
	interface eth1
	virtual_router_id 52
	priority 150
	advert_int 1
	authentication {
		auth_type PASS
		auth_pass k@l!ve2
	}
	virtual_ipaddress {
		192.168.100.10
	}
}
vrrp_instance VI_3 {
	state BACKUP
	interface eth0
	virtual_router_id 53
	priority 100
	advert_int 1
	authentication {
		auth_type PASS
		auth_pass k@l!ve3
	}
	virtual_ipaddress {
		192.168.200.12
		192.168.200.13
	}
}
vrrp_instance VI_4 {
	state BACKUP
	interface eth1
	virtual_router_id 54
	priority 100
	advert_int 1
	authentication {
		auth_type PASS
		auth_pass k@l!ve4
	}
	virtual_ipaddress {
		192.168.100.11
	}
}
# Virtual Servers definitions
virtual_server 192.168.200.10 80 {
	delay_loop 30
	lb_algo wrr
	lb_kind NAT
	persistence_timeout 50
	protocol TCP
	sorry_server 192.168.100.100 80
	real_server 192.168.100.2 80 {
		weight 2
		HTTP_GET {
			url {
				path /testurl/test.jsp
				digest ec90a42b99ea9a2f5ecbe213ac9eba03
			}
			url {
				path /testurl2/test.jsp
				digest 640205b7b0fc66c1ea91c463fac6334c
			}
			connect_timeout 3
			retry 3
			delay_before_retry 2
		}
	}
	real_server 192.168.100.3 80 {
		weight 1
		HTTP_GET {
			url {
				path /testurl/test.jsp
				digest 640205b7b0fc66c1ea91c463fac6334c
			}
			connect_timeout 3
			retry 3
			delay_before_retry 2
		}
	}
}
virtual_server 192.168.200.12 443 {
	delay_loop 20
	lb_algo rr
	lb_kind NAT
	persistence_timeout 360
	protocol TCP
	real_server 192.168.100.2 443 {
		weight 1
		TCP_CHECK {
			connect_timeout 3
		}
	}
	real_server 192.168.100.3 443 {
		weight 1
		TCP_CHECK {
			connect_timeout 3
		}
	}
}
`,
	keyman: `c Comments
c This is a comment

c Strings, numbers and characters
"'this' is a string"
'and so is "this"'
U+0041 d65 x41   c these are all the letter A

c Prefixes and Virtual Keys
c Match RAlt+E on desktops, Ctrl+Alt+E on web because L/R Alt not consistently supported in browsers.
$KeymanOnly: + [RALT K_E] > "€"
$KeymanWeb: + [CTRL ALT K_E] > "€"

c Example Code
c =====================Begin Identity Section===================================================
c 
c Mnemonic input method for Amharic script on US-QWERTY
c keyboards for Keyman version 7.1, compliant with Unicode 4.1 and later.
c 

store(&VERSION) '9.0'
store(&Name) "Amharic"
c store(&MnemonicLayout) "1"
store(&CapsAlwaysOff) "1"
store(&Copyright) "Creative Commons Attribution 3.0"
store(&Message) "This is an Amharic language mnemonic input method for Ethiopic script that requires Unicode 4.1 support."
store(&WINDOWSLANGUAGES) 'x045E x045E'
store(&LANGUAGE) 'x045E'
store(&EthnologueCode) "amh"
store(&VISUALKEYBOARD) 'gff-amh-7.kvk'
store(&KMW_EMBEDCSS) 'gff-amh-7.css'
HOTKEY "^%A"
c 
c =====================End Identity Section=====================================================

c =====================Begin Data Section=======================================================

c ---------------------Maps for Numbers---------------------------------------------------------
store(ArabOnes) '23456789'
store(ones)     '፪፫፬፭፮፯፰፱'
store(tens)     '፳፴፵፶፷፸፹፺'
store(arabNumbers) '123456789'
store(ethNumbers) '፩፪፫፬፭፮፯፰፱፲፳፴፵፶፷፸፹፺፻፼'
store(arabNumbersWithZero) '0123456789'
store(ColonOrComma) ':,'
store(ethWordspaceOrComma) '፡፣'
c ---------------------End Numbers--------------------------------------------------------------

c =====================End Data Section=========================================================

c =====================Begin Functional Section=================================================
c 
store(&LAYOUTFILE) 'gff-amh-7_layout.js'
store(&BITMAP) 'amharic.bmp'
store(&TARGETS) 'any windows'
begin Unicode > use(main)
group(main) using keys    

c ---------------------Input of Numbers---------------------------------------------------------

c Special Rule for Arabic Numerals
c 
c The following attempts to auto-correct the use of Ethiopic wordspace and
c Ethiopic comma within an Arabic numeral context.  Ethiopic wordspace gets
c used erroneously in time formats and Ethiopic commas as an order of thousands
c delimiter. The correction context is not known until numerals appear on _both_
c sides of the punctuation.
c 
	any(arabNumbersWithZero) any(ethWordspaceOrComma) + any(arabNumbers) > index(arabNumbersWithZero,1) index(ColonOrComma,2) index(arabNumbers,3)

c Ethiopic Numerals

	"'" + '1' > '፩'
	"'" + any(ArabOnes) > index(ones,2)

c special cases for multiples of one
	'፩'  + '0' > '፲'
	'፲'  + '0' > '፻'
	'፻'  + '0' > '፲፻'
	'፲፻' + '0' > '፼'
	'፼'  + '0' > '፲፼'    
	'፲፼' + '0' > '፻፼' 
	'፻፼'  + '0' > '፲፻፼'
	'፲፻፼' + '0' > '፼፼'
	'፼፼' + '0' > context beep  c do not go any higher, we could beep here

c upto the order of 100 million
	any(ones)     + '0' > index(tens,1)
	any(tens)     + '0' > index(ones,1) '፻'  c Hundreds
	any(ones)  '፻ '+ '0' > index(tens,1) '፻'  c Thousands
	any(tens)  '፻' + '0' > index(ones,1) '፼'  c Ten Thousands
	any(ones)  '፼' + '0' > index(tens,1) '፼'  c Hundred Thousands
	any(tens)  '፼' + '0' > index(ones,1) '፻፼' c Millions
	any(ones) '፻፼' + '0' > index(tens,1) '፻፼' c Ten Millions
	any(tens) '፻፼' + '0' > index(ones,1) '፼፼' c Hundred Millions

c enhance this later, look for something that can copy a match over
	any(ethNumbers) + any(arabNumbers) > index(ethNumbers,1)  index(ethNumbers,2)
c ---------------------End Input of Numbers-----------------------------------------------------
																						
c =====================End Functional Section===================================================
`,
	kotlin: `// Numbers
123
123L
0x0F
0b00001011
123.5
123.5e10
123.5f
123.5F

// Strings and interpolation
'2'
'\\uFF00'
'\\''

"foo $bar \\"baz"
"""
foo \${40 + 2}
baz\${bar()}
"""

// Labels
loop@ for (i in 1..100) {
	for (j in 1..100) {
		if (...)
		break@loop
	}
}

// Annotations
public class MyTest {
	lateinit var subject: TestSubject

	@SetUp fun setup() {
		subject = TestSubject()
	}

	@Test fun test() {
		subject.method()  // dereference directly
	}
}

// Full example
package com.example.html

interface Element {
	fun render(builder: StringBuilder, indent: String)

	override fun toString(): String {
		val builder = StringBuilder()
		render(builder, "")
		return builder.toString()
	}
}

class TextElement(val text: String): Element {
	override fun render(builder: StringBuilder, indent: String) {
		builder.append("$indent$text\\n")
	}
}

abstract class Tag(val name: String): Element {
	val children = arrayListOf<Element>()
	val attributes = hashMapOf<String, String>()

	protected fun initTag<T: Element>(tag: T, init: T.() -> Unit): T {
		tag.init()
		children.add(tag)
		return tag
	}

	override fun render(builder: StringBuilder, indent: String) {
		builder.append("$indent<$name\${renderAttributes()}>\\n")
		for (c in children) {
			c.render(builder, indent + "  ")
		}
		builder.append("$indent</$name>\\n")
	}

	private fun renderAttributes(): String? {
		val builder = StringBuilder()
		for (a in attributes.keySet()) {
			builder.append(" $a=\\"\${attributes[a]}\\"")
		}
		return builder.toString()
	}
}

abstract class TagWithText(name: String): Tag(name) {
	operator fun String.plus() {
		children.add(TextElement(this))
	}
}

class HTML(): TagWithText("html") {
	fun head(init: Head.() -> Unit) = initTag(Head(), init)

	fun body(init: Body.() -> Unit) = initTag(Body(), init)
}

class Head(): TagWithText("head") {
	fun title(init: Title.() -> Unit) = initTag(Title(), init)
}

class Title(): TagWithText("title")

abstract class BodyTag(name: String): TagWithText(name) {
	fun b(init: B.() -> Unit) = initTag(B(), init)
	fun p(init: P.() -> Unit) = initTag(P(), init)
	fun h1(init: H1.() -> Unit) = initTag(H1(), init)
	fun a(href: String, init: A.() -> Unit) {
		val a = initTag(A(), init)
		a.href = href
	}
}

class Body(): BodyTag("body")

class B(): BodyTag("b")
class P(): BodyTag("p")
class H1(): BodyTag("h1")
class A(): BodyTag("a") {
	public var href: String
	get() = attributes["href"]!!
	set(value) {
		attributes["href"] = value
	}
}

fun html(init: HTML.() -> Unit): HTML {
	val html = HTML()
	html.init()
	return html
}
`,
	kumir: `| Example
алг
нач
	| Решение квадратного уравнения.
	вещ a, b, c
	вещ таб корни[1:2]
	цел индекс, число корней
	вывод "Укажите первый коэффициент: "
	ввод a
	вывод нс, "Укажите второй коэффициент: "
	ввод b
	вывод нс, "Укажите свободный член: "
	ввод c
	решить квур(a, b, c, число корней, корни)
	если число корней = -1
		то
			вывод нс, "Первый коэффициент не может быть равен нулю.", нс
		иначе
			если число корней = 0
				то
					вывод нс, "Уравнение не имеет корней.", нс
				иначе
					если число корней = 1
						то
							вывод нс, "Уравнение имеет один корень.", нс
							вывод "x = ", корни[1], нс
						иначе
							вывод нс, "Уравнение имеет два корня.", нс
							нц для индекс от 1 до число корней шаг 1
								вывод "x", индекс, " = ", корни[индекс], нс
							кц
					все
			все
	все
кон

алг решить квур(арг вещ a, b, c, арг рез цел число корней, арг рез вещ таб корни[1:2])
нач
	вещ дискриминант
	если a = 0
		то
			число корней := -1
		иначе
			дискриминант := b**2 - 4 * a * c
			если дискриминант > 0
				то
					корни[1] := (-b - sqrt(дискриминант)) / (2 * a)
					корни[2] := (-b + sqrt(дискриминант)) / (2 * a)
					число корней := 2
				иначе
					если дискриминант = 0
						то
							корни[1] := -b / (2 * a)
							число корней := 1
						иначе
							число корней := 0
					все
			все
	все
кон
`,
	kusto: `// Full example
// Source: https://docs.microsoft.com/en-us/azure/data-explorer/kusto/query/tutorial?pivots=azuredataexplorer

StormEvents
| where StartTime > datetime(2007-02-01) and StartTime < datetime(2007-03-01)
| where EventType == 'Flood' and State == 'CALIFORNIA'
| project StartTime, EndTime , State , EventType , EpisodeNarrative
`,
	"linker-script": `/* Full example */
/* Source: https://github.com/stivale/stivale2-barebones/blob/master/kernel/linker.ld */

/* We want the symbol _start to be our entry point */
ENTRY(_start)

/* Define the program headers we want so the bootloader gives us the right */
/* MMU permissions */
PHDRS
{
	null    PT_NULL    FLAGS(0) ;                   /* Null segment */
	text    PT_LOAD    FLAGS((1 << 0) | (1 << 2)) ; /* Execute + Read */
	rodata  PT_LOAD    FLAGS((1 << 2)) ;            /* Read only */
	data    PT_LOAD    FLAGS((1 << 1) | (1 << 2)) ; /* Write + Read */
}

SECTIONS
{
	/* We wanna be placed in the topmost 2GiB of the address space, for optimisations */
	/* and because that is what the stivale2 spec mandates. */
	/* Any address in this region will do, but often 0xffffffff80000000 is chosen as */
	/* that is the beginning of the region. */
	. = 0xffffffff80000000;

	.text : {
		*(.text .text.*)
	} :text

	/* Move to the next memory page for .rodata */
	. += CONSTANT(MAXPAGESIZE);

	/* We place the .stivale2hdr section containing the header in its own section, */
	/* and we use the KEEP directive on it to make sure it doesn't get discarded. */
	.stivale2hdr : {
		KEEP(*(.stivale2hdr))
	} :rodata

	.rodata : {
		*(.rodata .rodata.*)
	} :rodata

	/* Move to the next memory page for .data */
	. += CONSTANT(MAXPAGESIZE);

	.data : {
		*(.data .data.*)
	} :data

	.bss : {
		*(COMMON)
		*(.bss .bss.*)
	} :data
}
`,
	latex: `% Comments
% This is a comment

% Commands
\\begin{document}
\\documentstyle[twoside,epsfig]{article}
\\usepackage{epsfig,multicol}

% Math mode
$\\alpha$
H$_{2}$O
45$^{\\circ}$C
`,
	latte: `{* Full example *}
<!DOCTYPE html>
<html>
	<head>
		<title>{$title|upper}</title>
	</head>
	<body>
		{if count($menu) > 1}
			<ul class="menu">
				{foreach $menu as $item}
				<li><a href="{$item->href}">{$item->caption}</a></li>
				{/foreach}
			</ul>
		{/if}
	</body>
</html>
`,
	less: `// Comments
// Single line comment
/* Multi-line
comment */

// Variables
@nice-blue: #5B83AD;
@light-blue: @nice-blue + #111;

// At-rules
@media screen and (min-width: 320px) {}

// Mixins
.bordered {
	border-top: dotted 1px black;
	border-bottom: solid 2px black;
}
#menu a {
	.bordered;
}
#header a {
	color: orange;
	#bundle > .button;
}

// Mixins with parameters
.foo (@bg: #f5f5f5, @color: #900) {
	background: @bg;
	color: @color;
}
.bar {
	.foo();
}
.class1 {
	.mixin(@margin: 20px; @color: #33acfe);
}
.class2 {
	.mixin(#efca44; @padding: 40px);
}

// Interpolation
@mySelector: banner;
.@{mySelector} {
	font-weight: bold;
}
@property: color;
.widget {
	@{property}: #0ee;
	background-@{property}: #999;
}
`,
	liquid: `{% comment %} Comments {% endcomment %}
{% comment %}This is a comment{% endcomment %}

{% comment %} if {% endcomment %}
{% if customer.name == 'kevin' %}
	Hey Kevin!
{% elsif customer.name == 'anonymous' %}
	Hey Anonymous!
{% else %}
	Hi Stranger!
{% endif %}

{% comment %} unless {% endcomment %}
{% unless product.title == 'Awesome Shoes' %}
These shoes are not awesome.
{% endunless %}

{% comment %} case {% endcomment %}
{% assign handle = 'cake' %}
{% case handle %}
	{% when 'cake' %}
		This is a cake
	{% when 'cookie' %}
		This is a cookie
	{% else %}
		This is not a cake nor a cookie
{% endcase %}

{% comment %} for {% endcomment %}
{% for i in (1..10) %}
	{% if i == 4 %}
		{% break %}
	{% elsif i == 6 %}
		{% continue %}
	{% else %}
		{{ i }}
	{% endif %}
{% endfor %}

{% comment %} range {% endcomment %}
{% for i in (3..5) %}
	{{ i }}
{% endfor %}

{% assign num = 4 %}
{% for i in (1..num) %}
	{{ i }}
{% endfor %}
`,
	lilypond: `% Full example
\\version "2.16.0"
\\include "example-header.ily"

#(ly:set-option 'point-and-click #f)
#(set-global-staff-size 24)

global = {
	\\time 4/4
	\\numericTimeSignature
	\\key c \\major
}

cf = \\relative c {
	\\clef bass
	\\global
	c4 c' b a |
	g a f d |
	e f g g, |
	c1
}

upper = \\relative c'' {
	\\global
	r4 s4 s2 |
	s1*2 |
	s2 s4 s
	\\bar "||"
}

bassFigures = \\figuremode {
	s1*2 | s4 <6> <6 4> <7> | s1
}

\\markup { "Exercise 3: Write 8th notes against the given bass line." }

\\score {
	\\new PianoStaff <<
		\\new Staff {
			\\context Voice = "added voice" \\with {
				\\consists "Balloon_engraver"
			}
			\\upper
		}

		\\new Staff = lower {
			<<
%      \\context Voice = "cantus firmus" \\with {
%        \\consists "Balloon_engraver"
%      }
				\\context Staff = lower \\cf
				\\new FiguredBass \\bassFigures
			>>
		}
	>>
	\\layout {}
	%{\\midi {
		\\tempo 4 = 120
	}%}
}
`,
	lisp: `; Comments
;; (foo bar)

; Strings
(foo "bar")

; With nested symbols
(foo "A string with a \`symbol ")

; With nested arguments
(foo "A string with an ARGUMENT ")

; Quoted symbols
(foo #'bar)

; Lisp properties
(foo :bar)

; Splices
(foo ,bar ,@bar)

; Keywords
(let foo (bar arg))

; Declarations
(declare foo)

; Booleans
(foo t)

; ; Booleans
(foo nil)

; Numbers
(foo 1)

; ; Numbers
(foo -1.5)

; Definitions
(defvar bar 23)

; ; Definitions
(defcustom bar 23)

; Function definitions
(defun multiply-by-seven (number)
       "Multiply NUMBER by seven."
       (* 7 number))

; Lambda expressions
(lambda (number) (* 7 number))
`,
	livescript: `# Comments
# This is a single line comment
/* This is a
multi line comment */

# Numbers
42
42km
3.754km_2
16~BadFace
36~azertyuiop0123456789

# Strings and interpolation
''
''''''
""
""""""
'Foo \\' bar
	baz'
'''Foo \\''' bar
	bar'''
"Foo #bar \\"
	#{2 + 2}\\""
"""#foobar \\""" #{ if /test/ == 'test' then 3 else 4}
	baz"""

# Regex
/foobar/ig
//
^foo # foo
[bar]*bA?z # barbaz
//m

# Full example
# example from Str.ls

split = (sep, str) -->
	str.split sep

join = (sep, xs) -->
	xs.join sep

lines = (str) ->
	return [] unless str.length
	str.split '\\n'

unlines = (.join '\\n')

words = (str) ->
	return [] unless str.length
	str.split /[ ]+/

unwords = (.join ' ')

chars = (.split '')

unchars = (.join '')

reverse = (str) ->
	str.split '' .reverse!.join ''

repeat = (n, str) -->
	result = ''
	for til n
		result += str
	result

capitalize = (str) ->
	(str.char-at 0).to-upper-case! + str.slice 1

camelize = (.replace /[-_]+(.)?/g, (, c) -> (c ? '').to-upper-case!)

# convert camelCase to camel-case, and setJSON to set-JSON
dasherize = (str) ->
		str
			.replace /([^-A-Z])([A-Z]+)/g, (, lower, upper) ->
				"#{lower}-#{if upper.length > 1 then upper else upper.to-lower-case!}"
			.replace /^([A-Z]+)/, (, upper) ->
				if upper.length > 1 then "#upper-" else upper.to-lower-case!

module.exports = {
	split, join, lines, unlines, words, unwords, chars, unchars, reverse,
	repeat, capitalize, camelize, dasherize,
}
`,
	llvm: `; Full Example
; Declare the string constant as a global constant.
@.str = private unnamed_addr constant [13 x i8] c"hello world\\0A\\00"

; External declaration of the puts function
declare i32 @puts(i8* nocapture) nounwind

; Definition of main function
define i32 @main() {   ; i32()*
entry:
	; Convert [13 x i8]* to i8*...
	%cast210 = getelementptr [13 x i8], [13 x i8]* @.str, i64 0, i64 0

	; Call puts function to write out the string to stdout.
	call i32 @puts(i8* %cast210)
	ret i32 0
}

; Named metadata
!0 = !{i32 42, null, !"string"}
!foo = !{!0}
`,
	lolcode: `BTW Comments
BTW Single line comment
OBTW Multi-line
comment TLDR

BTW Strings and special characters
"foo :"bar:" baz"
"foo:)bar:>baz"
"Interpolation :{works} too!"

BTW Numbers
42
-42
123.456

BTW Variable declaration
I HAS A var
var R "THREE"
var R 3

BTW Types
MAEK some_expr A YARN
some_var IS NOW A NUMBR

BTW Full example
OBTW Convert a number to hexadecimal. This
	 is returned as a string.
TLDR
HOW IZ I decimal_to_hex YR num
	I HAS A i ITZ 0
	I HAS A rem
	I HAS A hex_num ITZ A BUKKIT
	I HAS A decimal_num ITZ num
	IM IN YR num_loop
		rem R MOD OF decimal_num AN 16
		I HAS A hex_digit
		rem, WTF?
			OMG 10, hex_digit R "A", GTFO
			OMG 11, hex_digit R "B", GTFO
			OMG 12, hex_digit R "C", GTFO
			OMG 13, hex_digit R "D", GTFO
			OMG 14, hex_digit R "E", GTFO
			OMG 15, hex_digit R "F", GTFO
			OMGWTF, hex_digit R rem
		OIC
		hex_num HAS A SRS i ITZ hex_digit
		decimal_num R QUOSHUNT OF decimal_num AN 16
		BOTH SAEM decimal_num AN 0, O RLY?
			YA RLY, GTFO
			NO WAI, i R SUM OF i AN 1
		OIC
	IM OUTTA YR num_loop
	I HAS A hex_string ITZ A YARN
	IM IN YR string_reverse
		DIFFRINT i AN BIGGR OF i AN 0, O RLY?
			YA RLY, GTFO
		OIC
		hex_string R SMOOSH hex_string AN hex_num'Z SRS i MKAY
		i R DIFF OF i AN 1
	IM OUTTA YR string_reverse
	FOUND YR hex_string
IF U SAY SO
`,
	log: `Nginx example
/47.29.201.179 - - [28/Feb/2019:13:17:10 +0000] "GET /?p=1 HTTP/2.0" 200 5316 "https://domain1.com/?p=1" "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36" "2.75"

Mar 19 22:10:18 xxxxxx journal: xxxxxxx.mylabserver.com nginx: photos.example.com 127.0.0.1 - - [19/Mar/2018:22:10:18 +0000] "GET / HTTP/1.1" 200 1863 "-" "curl/7.29.0" "-"
Mar 19 22:10:24 xxxxxxx journal: xxxxxxxx.mylabserver.com nginx: photos.example.com 127.0.0.1 - - [19/Mar/2018:22:10:24 +0000] "GET / HTTP/1.1" 200 53324 "-" "curl/7.29.0" "-"

TLSv1.2 AES128-SHA 1.1.1.1 "Mozilla/5.0 (X11; Linux x86_64; rv:45.0) Gecko/20100101 Firefox/45.0"
TLSv1.2 ECDHE-RSA-AES128-GCM-SHA256 2.2.2.2 "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1"
TLSv1.2 ECDHE-RSA-AES128-GCM-SHA256 3.3.3.3 "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:58.0) Gecko/20100101 Firefox/58.0"
TLSv1.2 ECDHE-RSA-AES128-GCM-SHA256 4.4.4.4 "Mozilla/5.0 (Android 4.4.2; Tablet; rv:65.0) Gecko/65.0 Firefox/65.0"
TLSv1 AES128-SHA 5.5.5.5 "Mozilla/5.0 (Android 4.4.2; Tablet; rv:65.0) Gecko/65.0 Firefox/65.0"
TLSv1.2 ECDHE-RSA-CHACHA20-POLY1305 6.6.6.6 "Mozilla/5.0 (Linux; U; Android 5.0.2; en-US; XT1068 Build/LXB22.46-28) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/12.10.2.1164 Mobile Safari/537.36"
`,
	lua: `-- Comments
#!/usr/local/bin/lua
--
-- Single line comment
--[[ Multi line
comment ]]
--[====[ Multi line
comment ]====]

-- Strings
""
"Foo\\"bar"
"Foo\\
bar \\z
baz"
''
'Foo\\'bar'
'Foo\\
bar \\z
baz'
[[Multi "line"
string]]
[==[Multi [["line"]]
string]==]

-- Numbers
3
345
0xff
0xBEBADA
3, 3., 3.1, .3,
3e12, 3.e-41, 3.1E+1, .3e1
0x0.1E
0xA23p-4
0X1.921FB54442D18P+1

-- Full example
function To_Functable(t, fn)
	return setmetatable(t,
		{
			__index = function(t, k) return fn(k) end,
			__call = function(t, k) return t[k] end
		})
end

-- Functable bottles of beer implementation

spell_out = {
	"One", "Two", "Three", "Four", "Five",
	"Six", "Seven", "Eight", "Nine", "Ten",
	[0] = "No more",
	[-1] = "Lots more"
}

spell_out = To_Functable(spell_out, function(i) return i end)

bottles = To_Functable({"Just one bottle of beer"},
											 function(i)
												 return spell_out(i) .. " bottles of beer"
											 end)

function line1(i)
	return bottles(i) .. " on the wall, " .. bottles(i) .. "\\n"
end

line2 = To_Functable({[0] = "Go to the store, Buy some more,\\n"},
										 function(i)
											 return "Take one down and pass it around,\\n"
										 end)

function line3(i)
	return bottles(i) .. " on the wall.\\n"
end

function song(n)
	for i = n, 0, -1 do
		io.write(line1(i), line2(i), line3(i - 1), "\\n")
	end
end
`,
	magma: `// Full example
// Source: http://magma.maths.usyd.edu.au/magma/handbook/text/115#963
> D := Denominator;
> N := Numerator;
> farey := function(n)
>    f := [ RationalField() | 0, 1/n ];
>    p := 0;
>    q := 1;
>    while p/q lt 1 do
>       p := ( D(f[#f-1]) + n) div D(f[#f]) * N(f[#f])  - N(f[#f-1]);
>       q := ( D(f[#f-1]) + n) div D(f[#f]) * D(f[#f])  - D(f[#f-1]);
>       Append(~f, p/q);
>    end while;
>    return f;
> end function;
> function farey(n)
>    if n eq 1 then
>       return [RationalField() | 0, 1 ];
>    else
>       f := farey(n-1);
>       i := 0;
>       while i lt #f-1 do
>          i +:= 1;
>          if D(f[i]) + D(f[i+1]) eq n then
>             Insert( ~f, i+1, (N(f[i]) + N(f[i+1]))/(D(f[i]) + D(f[i+1])));
>          end if;
>       end while;
>       return f;
>    end if;
> end function;
> farey := func< n |
>               Sort(Setseq({ a/b : a in { 0..n }, b in { 1..n } | a le b }))>;
> farey(6);
[ 0, 1/6, 1/5, 1/4, 1/3, 2/5, 1/2, 3/5, 2/3, 3/4, 4/5, 5/6, 1 ]
`,
	makefile: `# Comments
# This is a comment
include foo # This is another comment

# Targets
kbd.o command.o files.o : command.h
display.o insert.o search.o files.o : buffer.h

.PHONY: clean
clean:
				rm *.o temp

# Variables
objects = main.o kbd.o command.o display.o \\
					insert.o search.o files.o utils.o

edit : $(objects)
				cc -o edit $(objects)

$(objects) : defs.h

%oo: $$< $$^ $$+ $$*

foo : bar/lose
				cd $(@D) && gobble $(@F) > ../$@

# Strings
STR = 'A string!'

HELLO = 'hello \\
world'

HELLO2 = "hello \\
world"

# Directives
include foo *.mk $(bar)

vpath %.c foo

override define two-lines =
foo
$(bar)
endef

ifeq ($(CC),gcc)
	libs=$(libs_for_gcc)
else
	libs=$(normal_libs)
endif

# Functions
whoami    := $(shell whoami)
host-type := $(shell arch)

y = $(subst 1,2,$(x))

dirs := a b c d
files := $(foreach dir,$(dirs),$(wildcard $(dir)/*))

reverse = $(2) $(1)
foo = $(call reverse,a,b)

$(foreach prog,$(PROGRAMS),$(eval $(call PROGRAM_template,$(prog))))

# Complete example
#!/usr/bin/make -f
# Generated automatically from Makefile.in by configure.
# Un*x Makefile for GNU tar program.
# Copyright (C) 1991 Free Software Foundation, Inc.

# This program is free software; you can redistribute
# it and/or modify it under the terms of the GNU
# General Public License …
…
…

SHELL = /bin/sh

#### Start of system configuration section. ####

srcdir = .

# If you use gcc, you should either run the
# fixincludes script that comes with it or else use
# gcc with the -traditional option.  Otherwise ioctl
# calls will be compiled incorrectly on some systems.
CC = gcc -O
YACC = bison -y
INSTALL = /usr/local/bin/install -c
INSTALLDATA = /usr/local/bin/install -c -m 644

# Things you might add to DEFS:
# -DSTDC_HEADERS        If you have ANSI C headers and
#                       libraries.
# -DPOSIX               If you have POSIX.1 headers and
#                       libraries.
# -DBSD42               If you have sys/dir.h (unless
#                       you use -DPOSIX), sys/file.h,
#                       and st_blocks in \`struct stat'.
# -DUSG                 If you have System V/ANSI C
#                       string and memory functions
#                       and headers, sys/sysmacros.h,
#                       fcntl.h, getcwd, no valloc,
#                       and ndir.h (unless
#                       you use -DDIRENT).
# -DNO_MEMORY_H         If USG or STDC_HEADERS but do not
#                       include memory.h.
# -DDIRENT              If USG and you have dirent.h
#                       instead of ndir.h.
# -DSIGTYPE=int         If your signal handlers
#                       return int, not void.
# -DNO_MTIO             If you lack sys/mtio.h
#                       (magtape ioctls).
# -DNO_REMOTE           If you do not have a remote shell
#                       or rexec.
# -DUSE_REXEC           To use rexec for remote tape
#                       operations instead of
#                       forking rsh or remsh.
# -DVPRINTF_MISSING     If you lack vprintf function
#                       (but have _doprnt).
# -DDOPRNT_MISSING      If you lack _doprnt function.
#                       Also need to define
#                       -DVPRINTF_MISSING.
# -DFTIME_MISSING       If you lack ftime system call.
# -DSTRSTR_MISSING      If you lack strstr function.
# -DVALLOC_MISSING      If you lack valloc function.
# -DMKDIR_MISSING       If you lack mkdir and
#                       rmdir system calls.
# -DRENAME_MISSING      If you lack rename system call.
# -DFTRUNCATE_MISSING   If you lack ftruncate
#                       system call.
# -DV7                  On Version 7 Unix (not
#                       tested in a long time).
# -DEMUL_OPEN3          If you lack a 3-argument version
#                       of open, and want to emulate it
#                       with system calls you do have.
# -DNO_OPEN3            If you lack the 3-argument open
#                       and want to disable the tar -k
#                       option instead of emulating open.
# -DXENIX               If you have sys/inode.h
#                       and need it 94 to be included.

DEFS =  -DSIGTYPE=int -DDIRENT -DSTRSTR_MISSING \\
				-DVPRINTF_MISSING -DBSD42
# Set this to rtapelib.o unless you defined NO_REMOTE,
# in which case make it empty.
RTAPELIB = rtapelib.o
LIBS =
DEF_AR_FILE = /dev/rmt8
DEFBLOCKING = 20

CDEBUG = -g
CFLAGS = $(CDEBUG) -I. -I$(srcdir) $(DEFS) \\
				-DDEF_AR_FILE=\\"$(DEF_AR_FILE)\\" \\
				-DDEFBLOCKING=$(DEFBLOCKING)
LDFLAGS = -g

prefix = /usr/local
# Prefix for each installed program,
# normally empty or \`g'.
binprefix =

# The directory to install tar in.
bindir = $(prefix)/bin

# The directory to install the info files in.
infodir = $(prefix)/info

#### End of system configuration section. ####

SRCS_C  = tar.c create.c extract.c buffer.c   \\
					getoldopt.c update.c gnu.c mangle.c \\
					version.c list.c names.c diffarch.c \\
					port.c wildmat.c getopt.c getopt1.c \\
					regex.c
SRCS_Y  = getdate.y
SRCS    = $(SRCS_C) $(SRCS_Y)
OBJS    = $(SRCS_C:.c=.o) $(SRCS_Y:.y=.o) $(RTAPELIB)

AUX =   README COPYING ChangeLog Makefile.in  \\
				makefile.pc configure configure.in \\
				tar.texinfo tar.info* texinfo.tex \\
				tar.h port.h open3.h getopt.h regex.h \\
				rmt.h rmt.c rtapelib.c alloca.c \\
				msd_dir.h msd_dir.c tcexparg.c \\
				level-0 level-1 backup-specs testpad.c

.PHONY: all
all:    tar rmt tar.info

tar:    $(OBJS)
				$(CC) $(LDFLAGS) -o $@ $(OBJS) $(LIBS)

rmt:    rmt.c
				$(CC) $(CFLAGS) $(LDFLAGS) -o $@ rmt.c

tar.info: tar.texinfo
				makeinfo tar.texinfo

.PHONY: install
install: all
				$(INSTALL) tar $(bindir)/$(binprefix)tar
				-test ! -f rmt || $(INSTALL) rmt /etc/rmt
				$(INSTALLDATA) $(srcdir)/tar.info* $(infodir)

$(OBJS): tar.h port.h testpad.h
regex.o buffer.o tar.o: regex.h
# getdate.y has 8 shift/reduce conflicts.

testpad.h: testpad
				./testpad

testpad: testpad.o
				$(CC) -o $@ testpad.o

TAGS:   $(SRCS)
				etags $(SRCS)

.PHONY: clean
clean:
				rm -f *.o tar rmt testpad testpad.h core

.PHONY: distclean
distclean: clean
				rm -f TAGS Makefile config.status

.PHONY: realclean
realclean: distclean
				rm -f tar.info*

.PHONY: shar
shar: $(SRCS) $(AUX)
				shar $(SRCS) $(AUX) | compress \\
					> tar-\`sed -e '/version_string/!d' \\
										 -e 's/[^0-9.]*\\([0-9.]*\\).*/\\1/' \\
										 -e q
										 version.c\`.shar.Z

.PHONY: dist
dist: $(SRCS) $(AUX)
				echo tar-\`sed \\
						 -e '/version_string/!d' \\
						 -e 's/[^0-9.]*\\([0-9.]*\\).*/\\1/' \\
						 -e q
						 version.c\` > .fname
				-rm -rf \`cat .fname\`
				mkdir \`cat .fname\`
				ln $(SRCS) $(AUX) \`cat .fname\`
				tar chZf \`cat .fname\`.tar.Z \`cat .fname\`
				-rm -rf \`cat .fname\` .fname

tar.zoo: $(SRCS) $(AUX)
				-rm -rf tmp.dir
				-mkdir tmp.dir
				-rm tar.zoo
				for X in $(SRCS) $(AUX) ; do \\
						echo $$X ; \\
						sed 's/$$/^M/' $$X \\
						> tmp.dir/$$X ; done
				cd tmp.dir ; zoo aM ../tar.zoo *
				-rm -rf tmp.dir
`,
	markdown: `<!-- Titles -->
Title 1
==

Title 2
-------

# Title 1
## Title 2
### Title 3
#### Title 4
##### Title 5
###### Title 6

<!-- Bold and italic -->
*Italic*
**Bold on
multiple lines**
*Italic on
multiple lines too*
__It also works with underscores__
_It also works with underscores_

__An empty line

is not allowed__

<!-- Links -->
[Prism](http://www.prismjs.com)
[Prism](http://www.prismjs.com "Prism")

[prism link]: http://www.prismjs.com (Prism)
[Prism] [prism link]

<!-- Lists and quotes -->
* This is
* an unordered list

1. This is an
2. ordered list

* *List item in italic*
* **List item in bold**
* [List item as a link](http://example.com "This is an example")

> This is a quotation
>> With another quotation inside
> _italic here_, __bold there__
> And a [link](http://example.com)

<!-- Code -->
Inline code between backticks \`<p>Paragraph</p>\`

    some_code(); /* Indented
    with four spaces */

	some_code(); /* Indented
	with a tab */

<!-- Raw HTML -->
> This is a quotation
> Containing <strong>raw HTML</strong>

<p>*Italic text inside HTML tag*</p>
`,
	mata: `// Full example
// Source: https://www.stata.com/manuals/m-1first.pdf page 12
numeric matrix tanh(numeric matrix u)
{
	numeric matrix eu, emu
	eu = exp(u)
	emu = exp(-u)
	return( (eu-emu):/(eu+emu) )
}
`,
	markup: `<!-- Embedded JS and CSS -->
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<title>I can haz embedded CSS and JS</title>
	<style>
		@media print {
			p { color: red !important; }
		}
	</style>
</head>
<body>
	<h1>I can haz embedded CSS and JS</h1>
	<script>
		if (true) {
			console.log('foo');
		}
	</script>

</body>
</html>

<!-- Invalid HTML -->
<l </ul>

<!-- Multi-line attribute values -->
<p title="foo
bar
baz">
`,
	matlab: `% Strings
myString = 'Hello, world';
otherString = 'You''re right';

% Comments
% Single line comment
%{ Multi-line
comment }%

% Numbers
x = 325.499
realmax + .0001e+308
e = 1 - 3*(4/3 - 1)
b = 1e-16 + 1 - 1e-16;
x = 2 + 3i;
z =
	4.7842 -1.0921i   0.8648 -1.5931i   1.2616 -2.2753i
	2.6130 -0.0941i   4.8987 -2.3898i   4.3787 -3.7538i
	4.4007 -7.1512i   1.3572 -5.2915i   3.6865 -0.5182i

% Control flow
if rem(a, 2) == 0
	 disp('a is even')
	 b = a/2;
end
switch dayString
	case 'Monday'
		disp('Start of the work week')
	case 'Tuesday'
		disp('Day 2')
	case 'Wednesday'
		disp('Day 3')
	case 'Thursday'
		disp('Day 4')
	case 'Friday'
		disp('Last day of the work week')
	otherwise
		disp('Weekend!')
end
n = 1;
nFactorial = 1;
while nFactorial < 1e100
	n = n + 1;
	nFactorial = nFactorial * n;
end

% Functions
q = integral(sqr,0,1);
y = parabola(x)
mygrid = @(x,y) ndgrid((-x:x/c:x),(-y:y/c:y));
[x,y] = mygrid(pi,2*pi);
`,
	maxscript: `-- Strings
-- Source: https://help.autodesk.com/view/MAXDEV/2022/ENU/?guid=GUID-5E5E1A71-24E2-4605-9720-2178B941DECC

plugin RenderEffect MonoChrome
name:"MonoChrome"
classID:#(0x9e6e9e77, 0xbe815df4)
(
rollout about_rollout "About..."
(
	label about_label "MonoChrome Filter"
)
on apply r_image progressCB: do
(
	progressCB.setTitle "MonoChrome Effect"
	local oldEscapeEnable = escapeEnable
	escapeEnable = false
	bmp_w = r_image.width
	bmp_h = r_image.height
	for y = 0 to bmp_h-1 do
	(
		if progressCB.progress y (bmp_h-1) then exit
		pixel_line = getPixels r_image [0,y] bmp_w
		for x = 1 to bmp_w do
		(
			p_v = pixel_line[x].value
			pixel_line[x] = color p_v p_v p_v pixel_line[x].alpha
		)--end x loop
		setPixels r_image [0,y] pixel_line
	)--end y loop
	escapeEnable = oldEscapeEnable
)--end on apply
)--end plugin
`,
	mel: `// Comments
// This is a comment

// Strings
"This is a string"
"foo \\"bar\\" baz"

// Numbers
42
3.14159
0xA2F

// Variables
$x
$floaty5000
$longDescriptiveName
$name_with_underscores
$_line

float $param;
int $counter;
string $name;
vector $position;

// Arrays, vectors and matrices
string $array[3] = {"first\\n", "second\\n", "third\\n"};
print($array[0]); // Prints "first\\n"
print($array[1]); // Prints "second\\n"
print($array[2]); // Prints "third\\n"

vector $roger = <<3.0, 7.7, 9.1>>;
vector $more = <<4.5, 6.789, 9.12356>>;
// Assign a vector to variable $test:
vector $test = <<3.0, 7.7, 9.1>>;
$test = <<$test.x, 5.5, $test.z>>
// $test is now <<3.0, 5.5, 9.1>>

matrix $a3[3][4] = <<2.5, 4.5, 3.25, 8.05;
	1.12, 1.3, 9.5, 5.2;
	7.23, 6.006, 2.34, 4.67>>

// Commands
pickWalk -d down;
string $mySelection[] = \`ls -selection\`;

setAttr ($mySelection[0]+".particleRenderType") 5;

addAttr -is true -ln "spriteTwist" -at "float" -min -180 -max 180 -dv 0.0 blue_nParticleShape;

// Full example
// From http://help.autodesk.com/view/MAYAUL/2015/ENU/?guid=Example_scripts_Dynamics_Time_Playback
// Alias Script File
// MODIFY THIS AT YOUR OWN RISK
//
// Creation Date: 8 May 1996
// Author: rh
//
// Description:
// Playback from frame 0 to frame <n> and return the
// 		the playback rate in frames/sec. If a negative frame
// count is given, this indicates silent mode. In silent
// mode, no output is printed.
//
// This version is intended for use in batch tests of dynamics.
// It requests particle and rigid body positions every frame.
//
// RETURN
// Frame rate in frames/sec
//
global proc float dynTimePlayback( float $frames )
{
	int $silent;
	// Get the list of particle shapes.
	//
	string $particleObjects[] = \`ls -type particle\`;
	int $particleCount = size( $particleObjects );
	// Get the list of transforms.
	// This will include rigid bodies.
	//
	string $transforms[] = \`ls -tr\`;
	int $trCount = size( $transforms );
		// Check for negative $frames. This indicates
	// $silent mode.
	//
	if ($frames < 0)
	{
		$silent = 1;
		$frames = -$frames;
	}
	else
	{
		$silent = 0;
	}
	// Setup the playback options.
	//
	playbackOptions -min 1 -max $frames -loop "once";
	currentTime -edit 0;
	// Playback the animation using the timerX command
	// to compute the $elapsed time.
	//
	float $startTime, $elapsed;
	$startTime = \`timerX\`;
	// play -wait;
	int $i;
	for ($i = 1; $i < $frames; $i++ )
	{
		// Set time
		//
		currentTime -e $i;
		int $obj;
		// Request count for every particle object.
		//
		for ($obj = 0; $obj < $particleCount; $obj++)
		{
			string $cmd = "getAttr " + $particleObjects[$obj]+".count";
			eval( $cmd );
		}
		// Request position for every transform
		// (includes every rigid body).
		//
		for ($obj = 0; $obj < $trCount; $obj++)
		{
			string $cmd = "getAttr " + $transforms[$obj]+".translate";
			eval ($cmd);
		}
	}
	$elapsed = \`timerX -st $startTime\`;
	// Compute the playback frame $rate. Print results.
	//
	float $rate = ($elapsed == 0 ? 0.0 : $frames / $elapsed);
	if ( ! $silent)
	{
		print( "Playback time: " + $elapsed + " secs\\n" );
		print( "Playback $rate: " + $rate + " $frames/sec\\n" );
	}
	return ( $rate );
} // timePlayback //
`,
	mermaid: `%% Full example
%% https://github.com/mermaid-js/mermaid/blob/develop/docs/examples.md#larger-flowchart-with-some-styling

graph TB
	sq[Square shape] --> ci((Circle shape))

	subgraph A
		od>Odd shape]-- Two line<br/>edge comment --> ro
		di{Diamond with <br/> line break} -.-> ro(Rounded<br>square<br>shape)
		di==>ro2(Rounded square shape)
	end

	%% Notice that no text in shape are added here instead that is appended further down
	e --> od3>Really long text with linebreak<br>in an Odd shape]

	%% Comments after double percent signs
	e((Inner / circle<br>and some odd <br>special characters)) --> f(,.?!+-*ز)

	cyr[Cyrillic]-->cyr2((Circle shape Начало));

	classDef green fill:#9f6,stroke:#333,stroke-width:2px;
	classDef orange fill:#f96,stroke:#333,stroke-width:4px;
	class sq,e green
	class di orange
`,
	metafont: `% Comments and strings
%This makes a comment.
"While this is a string."

% Numbers
0 1.2 .3

% Operators
eps*256>=1<>true
""&ditto
z1..z2--z3
5+-+4=3

% Types
path p[],q[]

% Concrete example
% From plain.mf
vardef penpos@#(expr b,d) =
(x@#r-x@#l,y@#r-y@#l)=(b,0) rotated d;
x@#=.5(x@#l+x@#r); y@#=.5(y@#l+y@#r) enddef;
`,
	mizar: `:: Full example
:: Example from http://webdocs.cs.ualberta.ca/~piotr/Mizar/Dagstuhl97/
environ
vocabulary SCM;
constructors ARYTHM, PRE_FF, NAT_1, REAL_1;
notation ARYTHM, PRE_FF, NAT_1;
requirements ARYTHM;
theorems REAL_1, PRE_FF, NAT_1, AXIOMS, CQC_THE1;
schemes NAT_1;
begin

P: for k being Nat
	st for n being Nat st n < k holds Fib (n+1) ≥ n
		holds Fib (k+1) ≥ k
proof let k be Nat; assume
IH: for n being Nat st n < k holds Fib (n+1) ≥ n;
	per cases;
		suppose k ≤ 1; then k = 0 or k = 0+1 by CQC_THE1:2;
			hence Fib (k+1) ≥ k by PRE_FF:1;
		suppose 1 < k; then
			1+1 ≤ k by NAT_1:38; then
			consider m being Nat such that
		A: k = 1+1+m by NAT_1:28;
			thus Fib (k+1) ≥ k proof
				per cases by NAT_1:19;
				suppose S1: m = 0;
					Fib (0+1+1+1) = Fib(0+1) + Fib(0+1+1) by PRE_FF:1
					              = 1 + 1 by PRE_FF:1;
					hence Fib (k+1) ≥ k by A, S1;
				suppose m > 0; then
					m+1 > 0+1 by REAL_1:59; then
					m ≥ 1 by NAT_1:38; then
				B: m+(m+1) ≥ m+1+1 by REAL_1:49;
				C: k = m+1+1 by A, AXIOMS:13;
				   m < m+1 & m+1 < m+1+1 by REAL_1:69; then
				   m < k & m+1 < k by C, AXIOMS:22; then
				D: Fib (m+1) ≥ m & Fib (m+1+1) ≥ m+1 by IH;
				   Fib (m+1+1+1) = Fib (m+1) + Fib (m+1+1) by PRE_FF:1; then
				   Fib (m+1+1+1) ≥ m+(m+1) by D, REAL_1:55;
		hence Fib(k+1) ≥ k by C, B, AXIOMS:22;
	end;
end;

for n being Nat holds Fib(n+1) ≥ n from Comp_Ind(P);
`,
	mongodb: `// Document
{
	'_id': ObjectId('5ec72ffe00316be87cab3927'),
	'code': Code('function () { return 22; }'),
	'binary': BinData(1, '232sa3d323sd232a32sda3s2d3a2s1d23s21d3sa'),
	'dbref': DBRef('namespace', ObjectId('5ec72f4200316be87cab3926'), 'db'),
	'timestamp': Timestamp(0, 0),
	'long': NumberLong(9223372036854775807),
	'decimal': NumberDecimal('1000.55'),
	'integer': 100,
	'maxkey': MaxKey(),
	'minkey': MinKey(),
	'isodate': ISODate('2012-01-01T00:00:00.000Z'),
	'regexp': RegExp('prism(js)?', 'i'),
	'string': 'Hello World',
	'numberArray': [1, 2, 3],
	'stringArray': ['1','2','3'],
	'randomKey': null,
	'object': { 'a': 1, 'b': 2 },
	'max_key2': MaxKey(),
	'number': 1234,
	'invalid-key': 123,
	noQuotesKey: 'value',
}

// Query
db.users.find({
	_id: { $nin: ObjectId('5ec72ffe00316be87cab3927') },
	age: { $gte: 18, $lte: 99 },
	field: { $exists: true }
})

// Update
db.users.updateOne(
	{
		_id: ObjectId('5ec72ffe00316be87cab3927')
	},
	{
		$set: { age: 30 },
		$inc: { updateCount: 1 }, 
		$push: { updateDates: new Date() } 
	}
)

// Aggregate
db.orders.aggregate([
	{ $sort : { age : -1 } },
	{ $project : { age : 1, status : 1, name : 1 } },
	{ $limit: 5 }
])
`,
	monkey: `' Comments
' This is a comment

#Rem            ' This is the start of a comment block
Some comment    ' We are inside the comment block
#End

' Strings
"Hello World"
"~qHello World~q"
"~tIndented~n"

' Numbers
0
1234
$3D0DEAD
$CAFEBABE

.0
0.0
.5
0.5
1.0
1.5
1.00001
3.14159265

' Variable types
Local myVariable:Bool = True
Local myVariable? = True
Local myVariable:Int = 1024
Local myVariable% = 1024
Local myVariable:Float = 3.141516
Local myVariable# = 3.141516
Local myVariable:String = "Hello world"
Local myVariable$ = "Hello world"

' Full example
Import mojo

Class MyApp Extends App

	Method OnCreate()

		SetUpdateRate 60

	End

	Method OnRender()

		Local date:=GetDate()

		Local months:=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

		Local day:=("0"+date[2])[-2..]
		Local month:=months[date[1]-1]
		Local year:=date[0]
		Local hour:=("0"+date[3])[-2..]
		Local min:=("0"+date[4])[-2..]
		Local sec:=("0"+date[5])[-2..] + "." + ("00"+date[6])[-3..]

		Local now:=hour+":"+min+":"+sec+"  "+day+" "+month+" "+year

		Cls
		DrawText now,DeviceWidth/2,DeviceHeight/2,.5,.5
	End

End

Function Main()

	New MyApp

End
`,
	moonscript: `-- Full example
class List
	new: (t) =>
		if t then return t

	append: table.insert
	join: table.concat

	map: (f,...) => List [f x,... for x in *self]

	-- apply a function on a list in-place
	apply: (f,...) =>
		for i = 1,#@ do @[i] = f @[i],...
		self

	clone: => @slice 1

	slice: (i1,i2=#@) =>
		-- workaround for MS slice bug
		if i2 < 0 then i2 = #@ + i2 + 1
		List [x for x in *self[i1,i2]]

	extend: (other) =>
		i = #self + 1
		for o in *other
			self[i] = o
			i += 1
		self

	partition: (pred,...) =>
		res = {}
		for x in *@
			k = pred x,...
			if not res[k] then res[k] = List!
			res[k]\\append x
		res

	lpartition: (n,npred,...) =>
		res = List[List{} for i = 1,n]
		for x in *@
			k = npred x,...
			if k >= 1 and k <= n
				res[k]\\append x
		res

	__concat: (l1,l2) ->
		List.clone(l1)\\extend l2

	__tostring: =>
		tmp = @slice(1,10)\\apply tostring
		if #@ > 10 then tmp\\append '...'
		"["..tmp\\join(',').."]"

-- hack to modify class so its constructor may return a new self
patch = (klass) -> getmetatable(klass).__call = (cls,...) ->
	self = setmetatable {}, cls.__base
	newself = cls.__init self, ...
	if newself
		self = setmetatable newself, cls.__base
	self

patch List

return List
`,
	n1ql: `-- Comments
# /* Multi-line
comment */

-- Strings
"foo \\"bar\\" baz"
'foo \\'bar\\' baz'
"Multi-line strings
are supported"
'Multi-line strings
are supported'

-- Parameters
$1 $2 $3

-- Operators
SELECT 1 AND 1;
SELECT 1 OR NULL;
SELECT EXISTS 1;
SELECT 2 BETWEEN 1 AND 3;

-- Functions and keywords
SELECT COUNT(*) AS total, MAX(foo) AS max_foo
FROM \`my_bucket\`
WHERE \`foo\` IS NOT NULL;
CREATE INDEX productName_index1 ON bucket_name(productName, ProductID)
WHERE type="product" USING GSI
WITH {"nodes":["node1:8091", "node2:8091", "node3:8091"]};

-- Identifiers
SELECT *
FROM \`my_bucket\`;
`,
	n4js: `// Keywords
class C {..}
interface I {..}

foo(c: C, i: I) {
	c instanceof C; // ok
	c instanceof I; // ok
}

// Annotations
// Final Methods
@Final
private tasks = new Map<string,Task>();

// Redefinition of Members
@Override
public async size(): int {
	…
}

// Dependency Injection
@Binder
@Bind(Storage,StorageInMemory)
class InMemoryBinder {}

@GenerateInjector @UseBinder(InMemoryBinder)
export public class TaskManagerTest {
	…
}

// Full example
// A Web User Interface in HTML
// NOTE: requires full example project bundled with N4JS IDE to run.

import { TaskManager } from "TaskManager";
import { Application, Response } from "express";
import express from "express";
import { Todo } from "model";


export class WebUI {

	private app: Application;

	@Inject
	private manager: TaskManager;

	public start() {

		this.app = express();

		this.app.get('/', async (req, res) => {
			let page = await this.renderHomePage();
			res.send(page);
		});

		this.app.get("/clear", async (req, res) => {
			await this.manager.clear();
			redirect(res, '/');
		});

		this.app.get("/create", async (req, res) => {
			let values = req.query as ~Object with {type: string, label: string};
			if (values && values.type === 'Todo' && values.label && values.label.length > 0) {
				await this.manager.createTodo(values.label);
			}
			redirect(res, '/');
		});

		this.app.listen(4000, '0.0.0.0', 511, function() {
			console.log("HTML server listening on http://localhost:4000/");
		});
	}

	protected async renderHomePage(): string {
		let tasks = await this.manager.getTasks();
		let todos = tasks.filter((task) => task instanceof Todo);
		return \`

<html>
<body>
	Your to-do's:
	<ul>
	\${
		todos.length === 0 ? '<li><em>none</em></li>\\n'
		: todos.map((task) =>
			'<li>' + task.label + ' <small>(id: ' + task.id + ')</small></li>'
		).join('\\n')
	}
	</ul>
	<hr/>
	<form action="/create" method="get">
	<input type="hidden" name="type" value="Todo">
	Label: <input type="text" name="label"><br>
	<input type="submit" value="Create Todo">
	</form>
	<hr/>
	<a href="/clear">[Clear All]</a>
</body>
</html>
\`;
	}
}

function redirect(res: Response, url: string) {
	res.header('Cache-Control', 'no-cache');
	res.redirect(301, url);
}
`,
	"nand2tetris-hdl": `// Comments
// Single line comment
/* Multi-line
comment */

// Literal values
0
32
true
false

// Full example
/*
 * Checks if two input bits are equal
 */
 
CHIP Eq {
	IN a, b;
	OUT out; // True iff a=b
	PARTS:
		Xor(a=a, b=b, out=uneq);
		Not(in=uneq, out=out);
}
`,
	naniscript: `; Comments
;Text of Comment
		;		Comment with tabs before

; Define
>DefineKey define 12 super usefull lines

; Label
# Section
#Section without whitespace
 # Section with whitespace
	# SectionWithTab

; Command
@
@ cmdWithWhiteSpaceBefore
@cmdWithTrailingSemicolon:
@paramlessCmd
	@cmdWithNoParamsAndWhitespaceBefore
		@cmdWithNoParamsAndTabBefore
			@cmdWithNoParamsAndTabAndSpacesBefore
			@cmdWithNoParamsWrappedInWhitespaces             
@cmdWithNoParamWithTrailingSpace 
@cmdWithNoParamWithMultipleTrailingSpaces   
@cmdWithNoParamWithTrailingTab	
@cmdWithNoParamWithTrailingTabAndSpaces	  
@cmdWithPositiveIntParam 1
@cmdWithNegativeIntParam -1
@cmdWithPositiveFloatParamAndNoFraction 1.
@cmdWithPositiveFloatParamAndFraction 1.10
@cmdWithPositiveHegativeFloatParamAndNoFraction -1.
@cmdWithPositiveHegativeFloatParamAndFraction -1.10
@cmdWithBoolParamAndPositive true
@cmdWithBoolParamAndNegative false
@cmdWithStringParam hello$co\\:mma"d"
@cmdWithQuotedStringNamelessParameter "hello grizzly"
@cmdWithQuotedStringNamelessParameterWithEscapedQuotesInTheValue "hello \\"grizzly\\""
@set choice="moe"
@command hello.grizzly
@command one,two,three
@command 1,2,3
@command true,false,true
@command hi:grizzly
@command hi:1
@command hi:true
@command 1 in:forest danger:true
@char 1 pos:0.25,-0.75 look:right

; Generic Text
Generic text with inlined commands[i] example[command 1 danger:true] more text here [act danger:false true:false]
"Integer: a = {a} malesuada a + b = {a + b}", Random(a, b) = {Random(a, b)}, Random("foo", "bar", "foobar") = {Random("foo", "bar", "foobar")}
UnclosedExpression{ab{cndum dui dolor tincidu{nt [s[fa]sdf [
"Integer: a = {a} malesuada a + b = {a + b}", Random(a, b) = {Random(a, b)}, Random("foo", "bar", "foobar") = {Random("foo", "bar", "foobar")},}

; Expressions
{}
{ Abs(a, d) + 12 - 1 / -230.0 + "Lol ipsum" }
Expressions inside a generic text line: Loreim ipsu,{ Abs(a, d) + 12 - 1 / -230.0 + "Lol ipsum" } doler sit amen {¯\\_(ツ)_/¯}.
@ExpressionInsteadOfNamelessParameterValue {x > 0}
@ExpressionBlendedWithNamelessParameterValue sdf{x > 0}df
@ExpressionsInsideNamedParameterValueWrappedInQuotes text:"{a} < {b}"
@ExpressionsBlendedWithNamedParameterValue param:32r2f,df{x > 0},d.{Abs(0) + 12.24 > 0}ff
@ExpressionsInsteadOfNamelessParameterAndQuotedParameter {remark} if:remark=="Saying \\\\"Stop { "the" } car\\\\" was a mistake."
`,
	nasm: `; Comments
; This is a comment

; Labels
label1:     ; a non-local label
.local:     ; this is really label1.local
..@foo:     ; this is a special symbol
label2:     ; another non-local label
.local:     ; this is really label2.local

; Registers
st0
st1
ax
rax
zmm4

; Strings
mov eax,'abcd'

db    'hello'               ; string constant
db    'h','e','l','l','o'   ; equivalent character constants
dd    'ninechars'           ; doubleword string constant
dd    'nine','char','s'     ; becomes three doublewords
db    'ninechars',0,0,0     ; and really looks like this

db \`\\u263a\`            ; UTF-8 smiley face
db \`\\xe2\\x98\\xba\`      ; UTF-8 smiley face
db 0E2h, 098h, 0BAh    ; UTF-8 smiley face

; Numbers
mov     ax,200          ; decimal
mov     ax,0200         ; still decimal
mov     ax,0200d        ; explicitly decimal
mov     ax,0d200        ; also decimal
mov     ax,0c8h         ; hex
mov     ax,$0c8         ; hex again: the 0 is required
mov     ax,0xc8         ; hex yet again
mov     ax,0hc8         ; still hex
mov     ax,310q         ; octal
mov     ax,310o         ; octal again
mov     ax,0o310        ; octal yet again
mov     ax,0q310        ; octal yet again
mov     ax,11001000b    ; binary

db    -0.2                    ; "Quarter precision"
dw    -0.5                    ; IEEE 754r/SSE5 half precision
dd    1.2                     ; an easy one
dd    0x1p+2                  ; 1.0x2^2 = 4.0
dq    0x1p+32                 ; 1.0x2^32 = 4 294 967 296.0
dq    1.e10                   ; 10 000 000 000.0
dq    1.e+10                  ; synonymous with 1.e10
dq    1.e-10                  ; 0.000 000 000 1
dt    3.141592653589793238462 ; pi
do    1.e+4000                ; IEEE 754r quad precision
`,
	neon: `# Full example
# my web application config

php:
	date.timezone: Europe/Prague
	zlib.output_compression: true  # use gzip

database:
	driver: mysql
	username: root
	password: beruska92

users:
	- Dave
	- Kryten
	- Rimmer
`,
	nevod: `// Comment
/* This is
multi-line
comment */
// This is single-line comment

// String
"text in double quotes"
'text in single quotes'
'case-sensitive text'!
'text ''Nevod'' in quotes'
"text ""Nevod"" in double quotes"
'text prefix'*
'case-sensitive text prefix'!*

// Keyword
@inside
@outside
@having
@search
@where

// Package Import
@require "Common/DateTime.np"
@require "Common/Url.np"

// Namespace
@namespace My { }
@namespace My.Domain { }

// Pattern
@pattern #Percentage = Num + ?Space + {'%', 'pct.', 'pct', 'percent'};
@pattern #GUID = Word(8) + [3 '-' + Word(4)] + '-' + Word(12);
@pattern #HashTag = '#' + {AlphaNum, Alpha, '_'} + [0+ {Word, '_'}];

// Full Example
@namespace Common
{
	@search @pattern Url(Domain, Path, Query, Anchor) =
		Method + Domain:Url.Domain + ?Port + ?Path:Url.Path +
		?Query:Url.Query + ?Anchor:Url.Anchor
	@where
	{
		Method = {'http', 'https' , 'ftp', 'mailto', 'file', 'data', 'irc'} + '://';
		Domain = Word + [1+ '.' + Word + [0+ {Word, '_', '-'}]];
		Port = ':' + Num;
		Path = ?'/' + [0+ {Word, '/', '_', '+', '-', '%', '.'}];
		Query = '?' + ?(Param + [0+ '&' + Param])
		@where
		{
			Param = Identifier + '=' + Identifier
			@where
			{
				Identifier = {Alpha, AlphaNum, '_'} + [0+ {Word, '_'}];
			};
		};
		Anchor(Value) = '#' + Value:{Word};
	};
}
`,
	nginx: `# Comments
# This is a comment

# Variables
fastcgi_param SERVER_NAME $server_name;

# Server Block
server { # simple reverse-proxy
	listen       80;
	server_name  domain2.com www.domain2.com;
	access_log   logs/domain2.access.log  main;
	
	# serve static files
	
	location ~ ^/(images|javascript|js|css|flash|media|static)/  {
		root    /var/www/virtual/big.server.com/htdocs;
		expires 30d;
	}

	# pass requests for dynamic content to rails/turbogears/zope, et al
	location / {
		proxy_pass      http://127.0.0.1:8080;
	}
}
`,
	nim: `# Comments
# This is a comment

# Strings
"This is a string."
"This is a string with \\"quotes\\" in it."
"""This is
a "multi-line"
string."""
""""A long string within quotes.""""
R"This is a raw string."
r"Some ""quotes"" inside a raw string."
r"""Raw strings
can also be multi-line."""
foo"This is a generalized raw string literal."
bar"""This is also
a generalized raw string literal."""

# Characters
'a'
'\\''
'\\t'
'\\15'
'\\xFC'

# Numbers
42
0xaf
0xf_2_c
0o07
0b1111_0000
0B0_10001110100_0000101001000111101011101111111011000101001101001001'f64
9_000'u
32.
32.1f32
32.e-5
32.2e+2
2'i16
2i16
0xfe'f32

# Full example
# Example from http://nim-by-example.github.io/oop_macro/
import macros

macro class*(head: expr, body: stmt): stmt {.immediate.} =
	# The macro is immediate so that it doesn't
	# resolve identifiers passed to it

	var typeName, baseName: NimNode

	if head.kind == nnkIdent:
		# \`head\` is expression \`typeName\`
		# echo head.treeRepr
		# --------------------
		# Ident !"Animal"
		typeName = head

	elif head.kind == nnkInfix and $head[0] == "of":
		# \`head\` is expression \`typeName of baseClass\`
		# echo head.treeRepr
		# --------------------
		# Infix
		#   Ident !"of"
		#   Ident !"Animal"
		#   Ident !"RootObj"
		typeName = head[1]
		baseName = head[2]

	else:
		quit "Invalid node: " & head.lispRepr

	# echo treeRepr(body)
	# --------------------
	# StmtList
	#   VarSection
	#     IdentDefs
	#       Ident !"name"
	#       Ident !"string"
	#       Empty
	#     IdentDefs
	#       Ident !"age"
	#       Ident !"int"
	#       Empty
	#   MethodDef
	#     Ident !"vocalize"
	#     Empty
	#     Empty
	#     FormalParams
	#       Ident !"string"
	#     Empty
	#     Empty
	#     StmtList
	#       StrLit ...
	#   MethodDef
	#     Ident !"age_human_yrs"
	#     Empty
	#     Empty
	#     FormalParams
	#       Ident !"int"
	#     Empty
	#     Empty
	#     StmtList
	#       DotExpr
	#         Ident !"this"
	#         Ident !"age"

	# create a new stmtList for the result
	result = newStmtList()

	# var declarations will be turned into object fields
	var recList = newNimNode(nnkRecList)

	# Iterate over the statements, adding \`this: T\`
	# to the parameters of functions
	for node in body.children:
		case node.kind:

			of nnkMethodDef, nnkProcDef:
				# inject \`this: T\` into the arguments
				let p = copyNimTree(node.params)
				p.insert(1, newIdentDefs(ident"this", typeName))
				node.params = p
				result.add(node)

			of nnkVarSection:
				# variables get turned into fields of the type.
				for n in node.children:
					recList.add(n)

			else:
				result.add(node)

	# The following prints out the AST structure:
	#
	# import macros
	# dumptree:
	#   type X = ref object of Y
	#     z: int
	# --------------------
	# TypeSection
	#   TypeDef
	#     Ident !"X"
	#     Empty
	#     RefTy
	#       ObjectTy
	#         Empty
	#         OfInherit
	#           Ident !"Y"
	#         RecList
	#           IdentDefs
	#             Ident !"z"
	#             Ident !"int"
	#             Empty

	result.insert(0,
		if baseName == nil:
			quote do:
				type \`typeName\` = ref object of RootObj
		else:
			quote do:
				type \`typeName\` = ref object of \`baseName\`
	)
	# Inspect the tree structure:
	#
	# echo result.treeRepr
	# --------------------
	# StmtList
	#   StmtList
	#     TypeSection
	#       TypeDef
	#         Ident !"Animal"
	#         Empty
	#         RefTy
	#           ObjectTy
	#             Empty
	#             OfInherit
	#               Ident !"RootObj"
	#             Empty   <= We want to replace this
	#   MethodDef
	#   ...

	result[0][0][0][2][0][2] = recList

	# Lets inspect the human-readable version of the output
	# echo repr(result)
	# Output:
	#  type
	#    Animal = ref object of RootObj
	#      name: string
	#      age: int
	#
	#  method vocalize(this: Animal): string =
	#    "..."
	#
	#  method age_human_yrs(this: Animal): int =
	#    this.age

# ---

class Animal of RootObj:
	var name: string
	var age: int
	method vocalize: string = "..."
	method age_human_yrs: int = this.age # \`this\` is injected

class Dog of Animal:
	method vocalize: string = "woof"
	method age_human_yrs: int = this.age * 7

class Cat of Animal:
	method vocalize: string = "meow"

# ---

var animals: seq[Animal] = @[]
animals.add(Dog(name: "Sparky", age: 10))
animals.add(Cat(name: "Mitten", age: 10))

for a in animals:
	echo a.vocalize()
	echo a.age_human_yrs()
`,
	nsis: `# Comments
; Single line comment
# Single line comment
/* Multi-line
comment */

# Strings
"foo \\"bar\\" baz"
'foo \\'bar\\' baz'

# Variables
LicenseLangString myLicenseData \${LANG_ENGLISH} "bigtest.nsi"
LicenseData $(myLicenseData)
StrCmp $LANGUAGE \${LANG_ENGLISH} 0 +2

# Compiler commands
!define VERSION "1.0.3"
!insertmacro MyFunc ""
`,
	nix: `# Comments
#
# Single line comment
/* Multi-line
comment */

# String
""
"foo\\"bar"
"foo
bar"

''''
''foo'''bar''
''
foo
bar
''

# String interpolation
"foo\${42}bar"
"foo\\\${42}bar" # This is not interpolated
''foo\${42}bar''
''foo''\${42}bar'' # This is not interpolated

# URLs and paths
ftp://ftp.nluug.nl/pub/gnu/hello/hello-2.1.1.tar.gz
http://example.org/foo.tar.bz2
/bin/sh
./builder.sh
~/foo.bar

# Integers, booleans and null
0
42

true
false

null

# Builtin functions
name = baseNameOf (toString url);
imap =
	if builtins ? genList then
		f: list: genList (n: f (n + 1) (elemAt list n)) (length list)
`,
	objectivec: `// Full example
#import <UIKit/UIKit.h>
#import "Dependency.h"

@protocol WorldDataSource
@optional
- (NSString*)worldName;
@required
- (BOOL)allowsToLive;
@end

@interface Test : NSObject <HelloDelegate, WorldDataSource> {
	NSString *_greeting;
}

@property (nonatomic, readonly) NSString *greeting;
- (IBAction) show;
@end

@implementation Test

@synthesize test=_test;

+ (id) test {
	return [self testWithGreeting:@"Hello, world!\\nFoo bar!"];
}

+ (id) testWithGreeting:(NSString*)greeting {
	return [[[self alloc] initWithGreeting:greeting] autorelease];
}

- (id) initWithGreeting:(NSString*)greeting {
	if ( (self = [super init]) ) {
		_greeting = [greeting retain];
	}
	return self;
}

- (void) dealloc {
	[_greeting release];
	[super dealloc];
}

@end
`,
	ocaml: `(* Comments *)
(* Simple comment *)
(* Multi-line
comment *)

(* Numbers *)
42
3.14159
42.
2.4E+2
10_452_102
0xf4
0xff_10_41
0o427
0b1100_1111_0000

(* Strings and characters *)
"Simple string."
"String with \\"quotes\\" in it."
'c' \`c\`
'\\'' \`\\\`\`
'\\123' \`\\123\`
'\\xf4'

(* Full example *)
module Make_interval(Endpoint : Comparable) = struct

	type t = | Interval of Endpoint.t * Endpoint.t
					 | Empty

	(** [create low high] creates a new interval from [low] to
			[high].  If [low > high], then the interval is empty *)
	let create ~low ~high =
		if Endpoint.compare low high > 0 then Empty
		else Interval (low,high)

	(** Returns true iff the interval is empty *)
	let is_empty = function
		| Empty -> true
		| Interval _ -> false

	(** [contains t x] returns true iff [x] is contained in the
			interval [t] *)
	let contains t x =
		match t with
		| Empty -> false
		| Interval (l,h) ->
			Endpoint.compare x l >= 0 && Endpoint.compare x h <= 0

	(** [intersect t1 t2] returns the intersection of the two input
			intervals *)
	let intersect t1 t2 =
		let min x y = if Endpoint.compare x y <= 0 then x else y in
		let max x y = if Endpoint.compare x y >= 0 then x else y in
		match t1,t2 with
		| Empty, _ | _, Empty -> Empty
		| Interval (l1,h1), Interval (l2,h2) ->
			create ~low:(max l1 l2) ~high:(min h1 h2)

end ;;
`,
	odin: `// Example
package main

import "core:fmt"

main :: proc() {
	i: int
	for i := 0; i < 100; i += 1 {
		fmt.println(i, " bottles of beer on the wall.\\n")
	}
}
`,
	opencl: `// OpenCL kernel code
// CLK_ADDRESS_CLAMP_TO_EDGE = aaa|abcd|ddd
constant sampler_t sampler = CLK_NORMALIZED_COORDS_FALSE | CLK_ADDRESS_CLAMP_TO_EDGE | CLK_FILTER_NEAREST;
typedef float type_single;

type_single filter_sum_single_3x3(read_only image2d_t imgIn,
																	constant float* filterKernel,
																	const int2 coordBase,
																	const int border)
{
	type_single sum = (type_single)(0.0f);
	const int rows = get_image_height(imgIn);
	const int cols = get_image_width(imgIn);
	int2 coordCurrent;
	int2 coordBorder;
	float color;

	// Image patch is row-wise accessed
	// Filter kernel is centred in the middle
	#pragma unroll
	for (int y = -ROWS_HALF_3x3; y <= ROWS_HALF_3x3; ++y)       // Start at the top left corner of the filter
	{
		coordCurrent.y = coordBase.y + y;
		#pragma unroll
		for (int x = -COLS_HALF_3x3; x <= COLS_HALF_3x3; ++x)   // And end at the bottom right corner
		{
			coordCurrent.x = coordBase.x + x;
			coordBorder = borderCoordinate(coordCurrent, rows, cols, border);
			color = read_imagef(imgIn, sampler, coordBorder).x;

			const int idx = (y + ROWS_HALF_3x3) * COLS_3x3 + x + COLS_HALF_3x3;
			sum += color * filterKernel[idx];
		}
	}

	return sum;
}

kernel void filter_single_3x3(read_only image2d_t imgIn,
															write_only image2d_t imgOut,
															constant float* filterKernel,
															const int border)
{
	int2 coordBase = (int2)(get_global_id(0), get_global_id(1));

	type_single sum = filter_sum_single_3x3(imgIn, filterKernel, coordBase, border);

	write_imagef(imgOut, coordBase, sum);
}
`,
	openqasm: `// Full example
// https://github.com/Qiskit/openqasm
/*
 * Repeat-until-success circuit for Rz(theta),
 * cos(theta-pi)=3/5, from Nielsen and Chuang, Chapter 4.
 */
OPENQASM 3;
include "stdgates.inc";

/*
 * Applies identity if out is 01, 10, or 11 and a Z-rotation by
 * theta + pi where cos(theta)=3/5 if out is 00.
 * The 00 outcome occurs with probability 5/8.
 */
def segment qubit[2]:anc, qubit:psi -> bit[2] {
	bit[2] b;
	reset anc;
	h anc;
	ccx anc[0], anc[1], psi;
	s psi;
	ccx anc[0], anc[1], psi;
	z psi;
	h anc;
	measure anc -> b;
	return b;
}

qubit input;
qubit ancilla[2];
bit flags[2] = "11";
bit output;

reset input;
h input;

// braces are optional in this case
while(int(flags) != 0) {
	flags = segment ancilla, input;
}
rz(pi - arccos(3 / 5)) input;
h input;
output = measure input;  // should get zero
`,
	oz: `% Comments
%
% Foobar

/* Foo
bar */

% Strings
""
"Foo \\"bar\\" baz"

% Numbers
0
42
0154
0xBadFace
0B0101
3.14159
2e8
3.E~7
4.8E12
&0
&a
&\\n
&\\124

% Functions and procedures
proc {Max X Y Z}
{Browse Z}
f(M Y)

% Full example
proc {DisMember X Ys}
	dis Ys = X|_ [] Yr in Ys = _|Yr {DisMember X Yr} end
end

class DataBase from BaseObject
	attr d
	meth init
		d := {NewDictionary}
	end
	meth dic($) @d end
	meth tell(I)
		case {IsFree I.1} then
			raise database(nonground(I)) end
		else
			Is = {Dictionary.condGet @d I.1 nil} in
			{Dictionary.put @d I.1 {Append Is [I]}}
		end
	end
	meth ask(I)
		case {IsFree I} orelse {IsFree I.1} then
			{DisMember I {Flatten {Dictionary.items @d}}}
		else
			{DisMember I {Dictionary.condGet @d I.1 nil}}
		end
	end
	meth entries($)
		{Dictionary.entries @d}
	end
end

declare
proc {Dynamic ?Pred}
	Pred = {New DataBase init}
end
proc {Assert P I}
	{P tell(I)}
end
proc {Query P I}
	{P ask(I)}
end

EdgeP = {Dynamic}
{ForAll
[edge(1 2)
	edge(2 1)   % Cycle
	edge(2 3)
	edge(3 4)
	edge(2 5)
	edge(5 6)
	edge(4 6)
	edge(6 7)
	edge(6 8)
	edge(1 5)
	edge(5 1)  % Cycle
]
proc {$ I} {Assert EdgeP I} end
}
`,
	parigp: `\\\\ Comments
\\\\ Single line comment
/* Multi line
comment */

\\\\ Strings
""
"Foo \\"bar\\" baz"

\\\\ Numbers
0.
42
3 . 14 15 9
5.2 E +12
.89

\\\\ Ignored whitespaces
p r i n t ("hello")
if err(1/i, E, print (E))
a + = b \\ / c
`,
	parser: `# Comments
$foo[bar] # Some comment

# Variables and functions
@navigation[]
$sections[^table::load[sections.cfg]]
$sections.uri

# Literals
$foo(3+$bar)
^switch[$sMode]{
	^case[def]{$result(true)}
}
^if(in "/news/"){}

# Escape sequences
^^
^"
^;

# Embedded in markup
<nav>
	<ul>
	^sections.menu{
		<li>
			<a href="$sections.uri">$sections.name</a>
		</li>
	}
	</ul>
</nav>

# Full example
@CLASS
MyTable

@create[uParam]
^switch[$uParam.CLASS_NAME]{
   ^case[string;void]{$t[^table::create{$uParam}]}
   ^case[table;MyTable]{$t[^table::create[$uParam]]}
   ^case[DEFAULT]{^throw[MyTable;Unsupported type $uParam.CLASS_NAME]}
}

# method will return value in different calling contexts
@GET[sMode]
^switch[$sMode]{
	^case[table]{$result[$t]}
	^case[bool]{$result($t!=0)}
	^case[def]{$result(true)}
	^case[expression;double]{$result($t)}
	^case[DEFAULT]{^throw[MyTable;Unsupported mode '$sMode']}
}


# method will handle access to the "columns"
@GET_DEFAULT[sName]
$result[$t.$sName]


# wrappers for all existing methods are required
@count[]
^t.count[]

@menu[jCode;sSeparator]
^t.menu{$jCode}[$sSeparator]


# new functionality
@remove[iOffset;iLimit]
$iLimit(^iLimit.int(0))
$t[^t.select(^t.offset[]<$iOffset || ^t.offset[]>=$iOffset+$iLimit)]
`,
	pascal: `// Comments
(* This is an
old style comment *)
{ This is a
Turbo Pascal comment }
// This is a Delphi comment.

// Strings and characters
'This is a pascal string'
''
'a'
^G
#7
#$f4
'A tabulator character: '#9' is easy to embed'

// Numbers
123
123.456
132.456e-789
132.456e+789
$7aff
&17
%11110101

// Full example
Type
	Str25    = String[25];
	TBookRec = Record
						 Title, Author,
						 ISBN  : Str25;
						 Price : Real;
						 End;

Procedure EnterNewBook(var newBook : TBookRec);
Begin
	Writeln('Please enter the book details: ');
	Write('Book Name: ');
	Readln(newBook.Title);
	Write('Author: ');
	Readln(newBook.Author);
	Write('ISBN: ');
	Readln(newBook.ISBN);
	Write('Price: ');
	Readln(newBook.Price);
End;

Var
	bookRecArray : Array[1..10] of TBookRec;
	i            : 1..10;

Begin
	For i := 1 to 10 do
		EnterNewBook(bookRecArray[i]);
	Writeln('Thanks for entering the book details');
	Write('Now choose a record to display from 1 to 10: ');
	Readln(i);
	Writeln('Here are the book details of record #',i,':');
	Writeln;
	Writeln('Title:  ', bookRecArray[i].Title);
	Writeln('Author: ', bookRecArray[i].Author);
	Writeln('ISBN:   ', bookRecArray[i].ISBN);
	Writeln('Price:  ', bookRecArray[i].Price);
	Readln;
End.
`,
	pascaligo: `// Comments
// Single line comment
(* Multi-line
comment *)

// Strings
"foo \\"bar\\" baz";
'foo \\'bar\\' baz';

// Numbers
123
123.456
-123.456
1e-23
123.456E789
0xaf
0xAF

// Functions
foo()
Bar()
_456()

// Full Example
function pop (const h : heap) : (heap * heap_element * nat) is
	begin
		const result : heap_element = get_top (h) ;
		var s : nat := size(h) ;
		const last : heap_element = get_force(s, h) ;
		remove s from map h ;
		h[1n] := last ;
		s := size(h) ;
		var i : nat := 0n ;
		var largest : nat := 1n ;
		var left : nat := 0n ;
		var right : nat := 0n ;
		var c : nat := 0n ;
		while (largest =/= i) block {
			c := c + 1n ;
			i := largest ;
			left := 2n * i ;
			right := left + 1n ;
			if (left <= s) then begin
				if (heap_element_lt(get_force(left , h) , get_force(i , h))) then begin
					largest := left ;
					const tmp : heap_element = get_force(i , h) ;
					h[i] := get_force(left , h) ;
					h[left] := tmp ;
				end else skip ;
			end else if (right <= s) then begin
				if (heap_element_lt(get_force(right , h) , get_force(i , h))) then begin
					largest := right ;
					const tmp : heap_element = get_force(i , h) ;
					h[i] := get_force(right , h) ;
					h[left] := tmp ;
				end else skip ;
			end else skip ;
		}
	end with (h , result , c)
`,
	pcaxis: `Full example
CHARSET="ANSI";
AXIS-VERSION="2000";
LANGUAGE="en";
CREATION-DATE="20170406 11:08";
TIMEVAL("time")=TLIST(A1, "1994"-"1996");
SUBJECT-AREA="";
UNITS="Number";

STUB="County","Sex";
VALUES("County")="State","Carlow","Dublin","Kildare","Kilkenny","Laois","Longford","Louth","Meath","Offaly","Westmeath","Wexford",
"Wicklow","Clare","Cork","Kerry","Limerick","Tipperary","Waterford","Galway","Leitrim","Mayo","Roscommon","Sligo","Cavan",
"Donegal","Monaghan";
VALUES("Sex")="Both sexes","Male","Female";
VALUES[de]("Sex")="Beide Geschlechter","Mann","Frau";
CODES("County")="-","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26";
CODES("Sex")="-","1","2";

DATA=
47163 87913 70192 84531 93120 343 5911 47038 51126 47870 95976 5643 66043 38987 63125 46882
57422 89992 11661 35817 92686 21781 37230 80669 14129 56688 81300 20184 88680 52135 17148 28192
92218 99175 76054 79907 90207 50547 31522 4244 91079 58776 83402 54109 21254 42946 83519 31242
10925 37377 45279 19704 96633 51732 34458 9746 91761 42687 51681 54409 61058 74227 70802 34546
64862 12022 29896 23616 50371 89808 57186 63895 94767 76388 66475 56716 50133 6604 52853 40763
70558 74672 58190 40909 6869 49937 9271 28067 99656 25674 69442 20608 28046 73287 60416 77515
51639 15516 40968 95524 6694 12956 83150 77099 45687 27241 6492 94966 36856 60693 720 74671
17309 4831 69376 67757 67499 69029 5209 50738 86947 77747 10996 9167 69176 98856 29531 5865
27654 52277 62293 30179 85049 76961 92772 65142 16252 6768 55784 20556 26088 97219 97245 44060
64577 91018 75157 42780 96186 62948 73288 74597 2145 16047 1671 2690 2275 45398 71478 53720
94832 91800 10398 84830 6009 9024 53132 97850 63832 13269 45376 38564 60343 85293 9330 16810
24898 76675 32778 26905 40945 37569 43532 38650 38316 75398 60829 91004 97946 49080 93534 78275
20002 87183 80802 56487 12666 18416 91632 74573 70729 97984 48479 93014 10281 90382 28497 15366
29720 25646 98513 47065 37662 94058 17383 47234 87293 37849 32087 98641 62012 12584 35492 87090
85157 90539 31005 67590 13627 44803 46789 8026 86877 18429 8935 78118 41728 67025 69312 52172
49224 68064 93025 1195 64873 684 90039 86065 67324 66534 1110 22354 36867 27479 76286 8539
`,
	peoplecode: `/* Full example */
/* Source: https://github.com/chrismalek/psoftToXML/blob/master/psftToXML.pcode */

class psoftToXML
	method RowsetToXML(&parentNode As XmlNode, &rowSetIn As Rowset) Returns XmlNode;
	method RecordToXML(&parentNode As XmlNode, &recordIn As Record) Returns XmlNode;
	method FieldToXML(&ParentNode As XmlNode, &fieldIn As Field) Returns XmlNode;
	method RowToXML(&ParentNode As XmlNode, &rowIn As Row) Returns XmlNode;
	method psoftToXML();
	property array of string fieldsToSkip;
private
	instance string &psObjectTypeString;
end-class;

method psoftToXML
	&psObjectTypeString = "PSOBJECTTYPE";
	%This.fieldsToSkip = CreateArrayRept("", 0);
end-method;

method FieldToXML
	/+ &ParentNode as XmlNode, +/
	/+ &fieldIn as Field +/
	/+ Returns XmlNode +/
	Local XmlNode &outNode;

	Local XmlNode &fldNode, &tempNode;

	&fldNode = &ParentNode.AddElement(&fieldIn.Name);

	&fldNode.AddAttribute("PSFIELDTYPE", &fieldIn.Type);
	&fldNode.AddAttribute(%This.psObjectTypeString, "FIELD");

	If &fieldIn.IsEditXlat Then
		&fldNode.AddAttribute("LongTranslateValue", &fieldIn.LongTranslateValue);
	End-If;

	Evaluate &fieldIn.Type
	When = "LONGCHAR"
	When = "IMAGE"
	When = "IMAGEREFERENCE"
		If All(&fieldIn.Value) Then

			&tempNode = &fldNode.AddCDataSection(&fieldIn.Value);
		End-If;
		Break;

	When = "NUMBER";
		&tempNode = &fldNode.AddText(&fieldIn.Value);
		Break;
	When-Other
		If All(&fieldIn.Value) Then
			&tempNode = &fldNode.AddText(&fieldIn.Value);
		End-If;

		Break;
	End-Evaluate;

	Return &outNode;
end-method;


method RecordToXML
	/+ &parentNode as XmlNode, +/
	/+ &recordIn as Record +/
	/+ Returns XmlNode +/

	Local XmlNode &outNode, &fieldNode;

	Local integer &i;

	&outNode = &parentNode.AddElement(&recordIn.Name);

	&outNode.AddAttribute(%This.psObjectTypeString, "RECORD");

	For &i = 1 To &recordIn.FieldCount

		If %This.fieldsToSkip.Find(&recordIn.GetField(&i).Name) <= 0 Then
			&fieldNode = %This.FieldToXML(&outNode, &recordIn.GetField(&i));
		End-If;
	End-For;

	Return &outNode;
end-method;


method RowToXML
	/+ &ParentNode as XmlNode, +/
	/+ &rowIn as Row +/
	/+ Returns XmlNode +/

	Local XmlNode &outNode, &recNode;

	Local integer &i;

	&outNode = &ParentNode.AddElement("ROW");
	&outNode.AddAttribute(&psObjectTypeString, "ROW");
	&outNode.AddAttribute("RowNumber", String(&rowIn.RowNumber));

	For &i = 1 To &rowIn.RecordCount
		&recNode = %This.RecordToXML(&outNode, &rowIn.GetRecord(&i));
	End-For;

	Local XmlNode &rsNode;
	For &i = 1 To &rowIn.ChildCount
		&rsNode = %This.RowsetToXML(&outNode, &rowIn.GetRowset(&i));

	End-For;

	Return &outNode;
end-method;


method RowsetToXML
	/+ &parentNode as XmlNode, +/
	/+ &rowSetIn as Rowset +/
	/+ Returns XmlNode +/

	Local XmlNode &outNode, &rowNode;

	Local integer &i;
	&outNode = &parentNode.AddElement(&rowSetIn.DBRecordName);
	&outNode.AddAttribute(&psObjectTypeString, "ROWSET");

	For &i = 1 To &rowSetIn.ActiveRowCount
		&rowNode = %This.RowToXML(&outNode, &rowSetIn.GetRow(&i));
	End-For;
	Return &outNode;
end-method;
`,
	perl: `# Comments
# Single line comment
=head1 Here There
	Be Pods!
=cut

# Strings
q/foo bar baz/;
q awhy not ?a;
qw(foo bar baz) q{foo bar baz}
q[foo bar baz] qq<foo bar baz>
"foo bar baz" 'foo bar baz' \`foo bar baz\`

# Regex
m/foo/ s/foo/bar/
m zfooz s zfoozbarz
qr(foo) m{foo} s(foo)(bar) s{foo}{bar}
m[foo] m<foo> tr[foo][bar] s<foo><bar>
/foo/i

# Variables
\${^POSTMATCH}
$^V
$element_count = scalar(@whatever);
keys(%users) = 1000;
$1, $_, %!;

# Numbers
12345
12345.67
.23E-10 # a very small number
3.14_15_92 # a very important number
4_294_967_296 # underscore for legibility
0xff # hex
0xdead_beef # more hex
0377 # octal (only numbers, begins with 0)
0b011011 # binary

# Full example
sub read_config_file {
	my ($class, $filename) = @_;

	unless (defined $filename) {
		my $home  = File::HomeDir->my_home || '.';
		$filename = File::Spec->catfile($home, '.pause');

		return {} unless -e $filename and -r _;
	}

	my %conf;
	if ( eval { require Config::Identity } ) {
		%conf = Config::Identity->load($filename);
		$conf{user} = delete $conf{username} unless $conf{user};
	}
	else { # Process .pause manually
		open my $pauserc, '<', $filename
			or die "can't open $filename for reading: $!";

		while (<$pauserc>) {
			chomp;
			next unless $_ and $_ !~ /^\\s*#/;

			my ($k, $v) = /^\\s*(\\w+)\\s+(.+)$/;
			Carp::croak "multiple enties for $k" if $conf{$k};
			$conf{$k} = $v;
		}
	}

	return \\%conf;
}
`,
	php: `<?php
// PHPDoc
/** @var \\DateTime[] An array of DateTime objects. */
/** @var string[] An array of string objects. */
/** @var callable[] An array of with callable functions or methods. */

/** @var \\ArrayObject|\\DateTime[] */
$dates = array()

/**
 * @param bool|\\DateTime $foo the first argument
 * @return string|null
 */
function bar($foo) { ... }

// $this
$this->foo = 2;

// Global variables
$_SERVER;
$_GET;
$_POST;
$argc; $argv;

// and many more

// Comments
// Single line comment
/* Multi-line
comment */
# Shell-like comment

// Strings
'foo \\'bar\\' baz'
"foo \\"bar\\" baz"
"a string # containing an hash"
$foo = <<<FOO
	Heredoc strings are supported too!
FOO;
$bar = <<<'BAR'
	And also Nowdoc strings
BAR;

// Variables
$some_var = 5;
$otherVar = "Some text";
$null = null;
$false = false;

// Functions
$json = json_encode($my_object);
$array1 = array("a" => "green", "red", "blue", "red");
$array2 = array("b" => "green", "yellow", "red");
$result = array_diff($array1, $array2);

// Constants
define('MAXSIZE', 42);
echo MAXSIZE;
json_decode($json, false, 512, JSON_BIGINT_AS_STRING)

// PHP 5.3+ support
namespace my\\name;
$c = new \\my\\name\\MyClass;
$arr = [1,2,3];
trait ezcReflectionReturnInfo {
	function getReturnType() { /*1*/ }
	function getReturnDescription() { /*2*/ }
}
function gen_one_to_three() {
	for ($i = 1; $i <= 3; $i++) {
		// Note that $i is preserved between yields.
		yield $i;
	}
}

// PHP embedded in HTML
?>
<div class="<?php echo $a ? 'foo' : 'bar'; ?>">
<?php if($var < 42) {
	echo "Something";
} else {
	echo "Something else";
} ?>
</div>
<?php

// String interpolation
$str = "This is $great!";
$foobar = "Another example: {\${$foo->bar()}}";
$a = <<<FOO
	Hello $world!
FOO;
$b = <<<"FOOBAR"
	Interpolation inside Heredoc strings {$obj->values[3]->name}
FOOBAR;
`,
	"plant-uml": `' Full example
' Source: https://plantuml.com/sequence-diagram
@startuml
participant Participant as Foo
actor       Actor       as Foo1
boundary    Boundary    as Foo2
control     Control     as Foo3
entity      Entity      as Foo4
database    Database    as Foo5
collections Collections as Foo6
queue       Queue       as Foo7
Foo -> Foo1 : To actor
Foo -> Foo2 : To boundary
Foo -> Foo3 : To control
Foo -> Foo4 : To entity
Foo -> Foo5 : To database
Foo -> Foo6 : To collections
Foo -> Foo7 : To queue
@enduml
`,
	plsql: `-- Comments
-- Single line comment
/* Multi-line
comment */

-- Operators
l_message  := 'Hello ' || place_in;

-- Keywords
CREATE OR REPLACE PROCEDURE
hello_place (place_in IN VARCHAR2)
IS
	l_message  VARCHAR2 (100);
BEGIN
	l_message  := 'Hello ' || place_in;
	DBMS_OUTPUT.put_line (l_message);
END hello_place;

DECLARE
	l_dept_id
	employees.department_id%TYPE := 10;
BEGIN
	DELETE FROM employees
		WHERE department_id = l_dept_id;

	DBMS_OUTPUT.put_line (SQL%ROWCOUNT);
END;

DECLARE
	l_message   VARCHAR2 (100) := 'Hello';
	l_message2  VARCHAR2 (100) := ' World!';
BEGIN
	IF SYSDATE >= TO_DATE ('01-JAN-2011')
	THEN
		l_message2 := l_message || l_message2;
		DBMS_OUTPUT.put_line (l_message2);
	ELSE
		DBMS_OUTPUT.put_line (l_message);
	END IF;
END;
`,
	powerquery: `// Comments
// This is a comment

// Simple example
let
	x = 1 + 1,
	y = 2 + 2,
	z = y + 1
in
	x + y + z

// Another example
let Orders = Table.FromRecords({  
	[OrderID = 1, CustomerID = 1, Item = "fishing rod", Price = 100.0],  
	[OrderID = 2, CustomerID = 1, Item = "1 lb. worms", Price = 5.0],  
	[OrderID = 3, CustomerID = 2, Item = "fishing net", Price = 25.0]}),  
	#"Capitalized Each Word" = Table.TransformColumns(Orders, {"Item", Text.Proper})  
in  
	#"Capitalized Each Word"

// Full example
let
	Source = Sales,
	LookupTable = #table(
	type table
		[
			#"FROM"=text,
			#"TO"=text
		], 
		{
			{"CEE","Central & Eastern Europe"},
			{"WE","Western Europe"}  
		}
	),

	JT = Table.NestedJoin(
		Source, 
		{"Area"}, 
		LookupTable, 
		{"FROM"}, 
		"Map", 
		JoinKind.LeftOuter
	),

	#"Expanded Map" = Table.ExpandTableColumn(
		JT, 
		"Map", 
		{"TO"}, 
		{"TO"}
	),

	#"Replace non-matches with original value" = Table.AddColumn(
		#"Expanded Map", 
		"Replaced", 
		each 
			if [TO] = null then [Area] 
			else [TO]
	),

	#"Remove original column" = Table.RemoveColumns(
		#"Replace non-matches with original value",
		{"Area", "TO"}
	),

	#"Renamed replace column to original name" = Table.RenameColumns(
		#"Remove original column",
		{{"Replaced", "Area"}}
	)

in
	#"Renamed replace column to original name"
`,
	powershell: `# Comments
# This is a comment
<# This is a
multi-line comment #>

# Variable Interpolation
$Name = "Alice"
Write-Host "Hello, my name is $Name."

# Full Example
Function SayHello([string]$name) {
	Write-Host "Hello, $name."
}
$Names = @("Bob", "Alice")

$Names | ForEach {
	SayHello $_
}
`,
	processing: `// Full example
// Processing implementation of Game of Life by Joan Soler-Adillon
// from https://processing.org/examples/gameoflife.html

// Size of cells
int cellSize = 5;

// How likely for a cell to be alive at start (in percentage)
float probabilityOfAliveAtStart = 15;

// Variables for timer
int interval = 100;
int lastRecordedTime = 0;

// Colors for active/inactive cells
color alive = color(0, 200, 0);
color dead = color(0);

// Array of cells
int[][] cells; 
// Buffer to record the state of the cells and use this while changing the others in the interations
int[][] cellsBuffer; 

// Pause
boolean pause = false;

void setup() {
	size (640, 360);

	// Instantiate arrays 
	cells = new int[width/cellSize][height/cellSize];
	cellsBuffer = new int[width/cellSize][height/cellSize];

	// This stroke will draw the background grid
	stroke(48);

	noSmooth();

	// Initialization of cells
	for (int x=0; x<width/cellSize; x++) {
		for (int y=0; y<height/cellSize; y++) {
			float state = random (100);
			if (state > probabilityOfAliveAtStart) { 
				state = 0;
			}
			else {
				state = 1;
			}
			cells[x][y] = int(state); // Save state of each cell
		}
	}
	background(0); // Fill in black in case cells don't cover all the windows
}


void draw() {

	//Draw grid
	for (int x=0; x<width/cellSize; x++) {
		for (int y=0; y<height/cellSize; y++) {
			if (cells[x][y]==1) {
				fill(alive); // If alive
			}
			else {
				fill(dead); // If dead
			}
			rect (x*cellSize, y*cellSize, cellSize, cellSize);
		}
	}
	// Iterate if timer ticks
	if (millis()-lastRecordedTime>interval) {
		if (!pause) {
			iteration();
			lastRecordedTime = millis();
		}
	}

	// Create  new cells manually on pause
	if (pause && mousePressed) {
		// Map and avoid out of bound errors
		int xCellOver = int(map(mouseX, 0, width, 0, width/cellSize));
		xCellOver = constrain(xCellOver, 0, width/cellSize-1);
		int yCellOver = int(map(mouseY, 0, height, 0, height/cellSize));
		yCellOver = constrain(yCellOver, 0, height/cellSize-1);

		// Check against cells in buffer
		if (cellsBuffer[xCellOver][yCellOver]==1) { // Cell is alive
			cells[xCellOver][yCellOver]=0; // Kill
			fill(dead); // Fill with kill color
		}
		else { // Cell is dead
			cells[xCellOver][yCellOver]=1; // Make alive
			fill(alive); // Fill alive color
		}
	} 
	else if (pause && !mousePressed) { // And then save to buffer once mouse goes up
		// Save cells to buffer (so we opeate with one array keeping the other intact)
		for (int x=0; x<width/cellSize; x++) {
			for (int y=0; y<height/cellSize; y++) {
				cellsBuffer[x][y] = cells[x][y];
			}
		}
	}
}



void iteration() { // When the clock ticks
	// Save cells to buffer (so we opeate with one array keeping the other intact)
	for (int x=0; x<width/cellSize; x++) {
		for (int y=0; y<height/cellSize; y++) {
			cellsBuffer[x][y] = cells[x][y];
		}
	}

	// Visit each cell:
	for (int x=0; x<width/cellSize; x++) {
		for (int y=0; y<height/cellSize; y++) {
			// And visit all the neighbours of each cell
			int neighbours = 0; // We'll count the neighbours
			for (int xx=x-1; xx<=x+1;xx++) {
				for (int yy=y-1; yy<=y+1;yy++) {  
					if (((xx>=0)&&(xx<width/cellSize))&&((yy>=0)&&(yy<height/cellSize))) { // Make sure you are not out of bounds
						if (!((xx==x)&&(yy==y))) { // Make sure to to check against self
							if (cellsBuffer[xx][yy]==1){
								neighbours ++; // Check alive neighbours and count them
							}
						} // End of if
					} // End of if
				} // End of yy loop
			} //End of xx loop
			// We've checked the neigbours: apply rules!
			if (cellsBuffer[x][y]==1) { // The cell is alive: kill it if necessary
				if (neighbours < 2 || neighbours > 3) {
					cells[x][y] = 0; // Die unless it has 2 or 3 neighbours
				}
			} 
			else { // The cell is dead: make it live if necessary      
				if (neighbours == 3 ) {
					cells[x][y] = 1; // Only if it has 3 neighbours
				}
			} // End of if
		} // End of y loop
	} // End of x loop
} // End of function

void keyPressed() {
	if (key=='r' || key == 'R') {
		// Restart: reinitialization of cells
		for (int x=0; x<width/cellSize; x++) {
			for (int y=0; y<height/cellSize; y++) {
				float state = random (100);
				if (state > probabilityOfAliveAtStart) {
					state = 0;
				}
				else {
					state = 1;
				}
				cells[x][y] = int(state); // Save state of each cell
			}
		}
	}
	if (key==' ') { // On/off of pause
		pause = !pause;
	}
	if (key=='c' || key == 'C') { // Clear all
		for (int x=0; x<width/cellSize; x++) {
			for (int y=0; y<height/cellSize; y++) {
				cells[x][y] = 0; // Save all to zero
			}
		}
	}
}
`,
	prolog: `% Comments
% This is a comment
/* This is a
multi-line comment */

% Numbers
42
3.1415

% Strings
"This is a string."
"This is a string \\
on multiple lines."
"A string with \\"quotes\\" in it."
"Another string with ""quotes"" in it."

% Example
:- dynamic fibo/2.
fibo(0, 1). fibo(1, 1).
fibo(N, F) :-
N >= 2, N1 is N - 1, N2 is N - 2,
fibo(N1, F1), fibo(N2, F2), F is F1 + F2,
assert(fibo(N,F):-!). % assert as first clause
`,
	promql: `# Examples
# These examples are taken from: https://prometheus.io/docs/prometheus/latest/querying/examples/

http_requests_total{job="apiserver", handler="/api/comments"}[5m]

http_requests_total{job=~".*server"}

max_over_time(deriv(rate(distance_covered_total[5s])[30s:5s])[10m:])

sum by (job) (
	rate(http_requests_total[5m])
)

sum by (app, proc) (
	instance_memory_limit_bytes - instance_memory_usage_bytes
) / 1024 / 1024
`,
	properties: `# Comments
# This is a comment
! This is a comment too

# Properties
some_key some_value
some\\ key\\ with\\ spaces : some value
some_key = some \\
multiline value
`,
	protobuf: `// Full example
syntax = "proto3";

package foo.generated;
option java_package = "org.foo.generated";
option optimize_for = SPEED;

// What's up with all the foo?
message Foo {

	message Bar {

		optional string key   = 1;
		optional Foo value = 2;
		optional string value_raw = 3 [deprecated=true];
	}

	enum Level {
		INFO  = 0;
		WARN  = 1;
		ERROR = 2;
	}

	repeated Property property = 1;
}
`,
	psl: `# Strings
# PSL Strings are properly rendered
print("Hello, World!");

# Escaped sequences are highlighted too
print("Goodbye \\H\\H\\H\\H\\H\\H\\H\\HHello, World!\\n");

# Multi-line strings are supported
print("multi
line");

# Numbers
a = 1;
b = 2.5;
c = 0xff;

# PSL Built-in Functions
p = nthargf(process(".*"), 1, " \\t", "\\n");
lock("test");
execute("OS", "pwd");

# PSL Keywords
foreach entry (["aaa", "bbb", "ccc"]) {
	if (grep("[bc]", entry)) {
		last;
	}
}

# PSL Constants
set("/CLASS/inst/paramA/state", WARN);
if (true) {
	PslDebug = -1;
}
output = execute("OS", "echo test");
if (errno) {
	print(ALARM." with errno=".errno."\\n");
}
print(trim(output, "\\n\\r\\t ", TRIM_LEADING_AND_TRAILING));
`,
	pug: `//- Comments
// Some
	multiline
	comment !

// This is a comment
But this is not

//- Doctype
doctype html
doctype 1.1
doctype html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN"

//- Tags
ul
	li Item A
	li Item B
	li Item C
foo(bar='baz')/
input(type='checkbox', checked=true.toString())
#content
div#foo(data-bar="foo")&attributes({'data-foo': 'bar'})

//- Markup
<div class="foo bar"></div>

//- Control flow
#user
	if user.description
		p.description= user.description
	else if authorised
		p.description.
			User has no description,
			why not add one...
	else
		p.description User has no description
ul
	each val in [1, 2, 3, 4, 5]
		li= val
case friends
	when 0
		p you have no friends
	when 1
		p you have a friend
	default
		p you have #{friends} friends

//- Inline JavaScript
script alert('test');
script(type="text/javascript").
	alert('foo');
	alert('bar');
- var classes = ['foo', 'bar', 'baz']
- for (var x = 0; x < 3; x++)
	li item

//- Keywords
include ./includes/head.pug
extends ./layout.pug
block content
append head

//- Mixins
mixin list
	ul
		li foo
		li bar
		li baz
+list
mixin pet(name)
	li.pet= name
ul
	+pet('cat')
	+pet('dog')

//- Filters
script
	:coffee
		console.log 'This is coffee script'
`,
	puppet: `# Comments
#
# Foobar
/* Foo
bar */

# Strings and interpolation
'foo \\'bar\\' baz'
"$foo \\"bar\\" \${baz}"

@(FOOBAR) # Unquoted heredoc string
Foo bar baz
FOOBAR

@("BARBAZ"/$L) # Quoted heredoc string
	$foo bar \${baz}
	|-BARBAZ

# Regular expressions
if $host =~ /^www(\\d+)\\./ {}
$foo = /foo
	bar # Extended regexes can include comments
baz/x

# Variables
$foo
$::foobar
$foo::bar::baz

# Functions
require apache
template('apache/vhost-default.conf.erb')
[1,20,3].filter |$value| { $value < 10 }

# All-in-one example
file {'ntp.conf':
	path    => '/etc/ntp.conf',
	ensure  => file,
	content => template('ntp/ntp.conf'),
	owner   => 'root',
	mode    => '0644',
}
package {'ntp':
	ensure => installed,
	before => File['ntp.conf'],
}
service {'ntpd':
	ensure    => running,
	subscribe => File['ntp.conf'],
}
Package['ntp'] -> File['ntp.conf'] ~> Service['ntpd']

$package_list = ['ntp', 'apache2', 'vim-nox', 'wget']
$myhash = { key => { subkey => 'b' }}

include ntp
require ntp
class {'ntp':}

define apache::vhost ($port, $docroot, $servername = $title, $vhost_name = '*') {
	include apache
	include apache::params
	$vhost_dir = $apache::params::vhost_dir
	file { "\${vhost_dir}/\${servername}.conf":
		content => template('apache/vhost-default.conf.erb'),
		owner   => 'www',
		group   => 'www',
		mode    => '644',
		require => Package['httpd'],
		notify  => Service['httpd'],
	}
}

apache::vhost {'homepages':
	port    => 8081,
	docroot => '/var/www-testhost',
}
Apache::Vhost['homepages']

node 'www1.example.com' {
	include common
	include apache
	include squid
}
node /^www\\d+$/ {
	include common
}

# comment
/* comment */

if $is_virtual {
	warning( 'Tried to include class ntp on virtual machine; this node may be misclassified.' )
}
elsif $operatingsystem == 'Darwin' {
	warning( 'This NTP module does not yet work on our Mac laptops.' )
else {
	include ntp
}

if $hostname =~ /^www(\\d+)\\./ {
	notify { "Welcome web server $1": }
}

case $operatingsystem {
	'Solaris':          { include role::solaris }
	'RedHat', 'CentOS': { include role::redhat  }
	/^(Debian|Ubuntu)$/:{ include role::debian  }
	default:            { include role::generic }
}
$rootgroup = $osfamily ? {
	'Solaris'          => 'wheel',
	/(Darwin|FreeBSD)/ => 'wheel',
	default            => 'root',
}

User <| groups == 'admin' |>
Concat::Fragment <<| tag == "bacula-storage-dir-\${bacula_director}" |>>

Exec <| title == 'update_migrations' |> {
	environment => 'RUBYLIB=/usr/lib/ruby/site_ruby/1.8/',
}

@user {'deploy':
	uid     => 2004,
	comment => 'Deployment User',
	group   => www-data,
	groups  => ["enterprise"],
	tag     => [deploy, web],
}

@@nagios_service { "check_zfs\${hostname}":
	use                 => 'generic-service',
	host_name           => "$fqdn",
	check_command       => 'check_nrpe_1arg!check_zfs',
	service_description => "check_zfs\${hostname}",
	target              => '/etc/nagios3/conf.d/nagios_service.cfg',
	notify              => Service[$nagios::params::nagios_service],
}
`,
	pure: `// Comments
#! shebang
// Single line comment
/* Multi-line
comment */

// Strings
"This is a string."
"This is a string with \\"quotes\\" in it."

// Numbers
4711
4711L
1.2e-3
.14
1000
0x3e8
01750
0b1111101000
inf
nan

// Inline code
%<
int mygcd(int x, int y)
{
	if (y == 0)
		return x;
	else
		return mygcd(y, x%y);
}
%>

%< -*- Fortran90 -*-
function fact(n) result(p)
	integer n, p
	p = 1
	do i = 1, n
		p = p*i
	end do
end function fact
%>

%< -*- C++ -*-

#include <pure/runtime.h>
#include <string>
#include <map>

// An STL map mapping strings to Pure expressions.

using namespace std;
typedef map<string,pure_expr*> exprmap;

// Since we can't directly deal with C++ classes in Pure, provide some C
// functions to create, destroy and manipulate these objects.

extern "C" exprmap *map_create()
{
	return new exprmap;
}

extern "C" void map_add(exprmap *m, const char *key, pure_expr *x)
{
	exprmap::iterator it = m->find(string(key));
	if (it != m->end()) pure_free(it->second);
	(*m)[key] = pure_new(x);
}

extern "C" void map_del(exprmap *m, const char *key)
{
	exprmap::iterator it = m->find(key);
	if (it != m->end()) {
		pure_free(it->second);
		m->erase(it);
	}
}

extern "C" pure_expr *map_get(exprmap *m, const char *key)
{
	exprmap::iterator it = m->find(key);
	return (it != m->end())?it->second:0;
}

extern "C" pure_expr *map_keys(exprmap *m)
{
	size_t i = 0, n = m->size();
	pure_expr **xs = new pure_expr*[n];
	for (exprmap::iterator it = m->begin(); it != m->end(); ++it)
		xs[i++] = pure_string_dup(it->first.c_str());
	pure_expr *x = pure_listv(n, xs);
	delete[] xs;
	return x;
}

extern "C" void map_destroy(exprmap *m)
{
	for (exprmap::iterator it = m->begin(); it != m->end(); ++it)
		pure_free(it->second);
	delete m;
}

%>

// Example
queens n       = catch reverse (search n 1 []) with
	search n i p = throw p if i>n;
							 = void [search n (i+1) ((i,j):p) | j = 1..n; safe (i,j) p];
	safe (i,j) p = ~any (check (i,j)) p;
	check (i1,j1) (i2,j2)
							 = i1==i2 || j1==j2 || i1+j1==i2+j2 || i1-j1==i2-j2;
end;
`,
	purebasic: `; Comments
; This is a comment

; Strings
"This a string."

; Numbers
42
3.14159
-42
-3.14159
.5
10.
2E10
4.2E-14
-3E+2

; PureBasic example
Procedure.s Test(s.s)
	Protected a$, b$, Result.s

	Result = Mid(s, 1, 3)

	ProcedureReturn Result
EndProcedure

Test()
End
`,
	python: `# Comments
# This is a comment
# -*- coding: <encoding-name> -*-

# Strings
"foo \\"bar\\" baz"
'foo \\'bar\\' baz'
""" "Multi-line" strings
are supported."""
''' 'Multi-line' strings
are supported.'''

# Numbers
7
2147483647
0o177
0b100110111
3
79228162514264337593543950336
0o377
0x100000000
0xdeadbeef
3.14
10.
.001
1e100
3.14e-10
0e0
3.14j
10.j
10j
.001j
1e100j
3.14e-10j

# Full example
def median(pool):
	'''Statistical median to demonstrate doctest.
	>>> median([2, 9, 9, 7, 9, 2, 4, 5, 8])
	7
	'''
	copy = sorted(pool)
	size = len(copy)
	if size % 2 == 1:
		return copy[(size - 1) / 2]
	else:
		return (copy[size/2 - 1] + copy[size/2]) / 2
if __name__ == '__main__':
	import doctest
	doctest.testmod()
`,
	purescript: `-- Comments
-- Single line comment
{- Multi-line
comment -}

-- Strings and characters
'a'
'\\n'
'\\^A'
'\\^]'
'\\NUL'
'\\23'
'\\o75'
'\\xFE'
"Here is a backslant \\\\ as well as \\137, \\
	\\a numeric escape character, and \\^X, a control character."

-- Numbers
42
123.456
123.456e-789
1e+3
0o74
0XAF

-- Full example
module Codewars.Kata.SumFracts (sumFracts) where

import Prelude

import Data.Foldable (foldl)
import Data.BigInt (BigInt, fromInt, toString)
import Data.List (List, length)
import Data.Tuple (Tuple(..))
import Data.Maybe (Maybe(..))
import Data.Ord (abs, signum)

reduce :: Tuple BigInt BigInt -> Tuple BigInt BigInt
reduce (Tuple num den) =
	let gcd' = gcd num den
		den' = den / gcd'
	in Tuple (num / gcd' * (signum den')) (abs den')
	 
sumFracts :: List (Tuple Int Int) -> Maybe String
sumFracts fracts =
	let fracts' = fracts <#> (\\(Tuple n d) -> Tuple (fromInt n) (fromInt d)) >>> reduce
			
		den = foldl (\\acc (Tuple _ d) -> lcm acc d) one fracts'
		num = foldl (\\acc (Tuple n d) -> acc + n * (den / d)) zero fracts'
		
		Tuple n d = reduce $ Tuple num den
			
		in if length fracts == 0
			then Nothing
			else if d == one
				then Just $ toString n
				else Just $ (toString n) >< " " >< (toString d)
`,
	q: `/ Comments
foo / This is a comment
/ This is a comment too

/
Some multi-line
comment here
\\

/ Character data and strings
"q"
"\\""
"\\\\"
"\\142"
"foo bar baz"

/ Symbols
\`
\`q
\`zaphod
\`:198.162.0.2:5042
\`:www.yourco.com:5042
\`.new

/ Numbers
42
b:-123h
c:1234567890j
pi:3.14159265
float1:1f
r:1.4142e
2.0
4.00e
f:1.23456789e-10
r:1.2345678e-10e
bit:0b
byte:0x2a
a:42
bit:1b

0w 0n 0W 0Wh 0Wj

/ Dates
d:2006.07.04
t:09:04:59.000
dt:2006.07.04T09:04:59.000
mon:2006.07m
mm:09:04
sec:09:04:59
d:2006.07.04

0Nm 0Nd 0Nz 0Nu 0Nv 0Wd 0Wt 0Wz

/ Verbs
99+L
x<42|x>98
(x<42)|x>98
42~(4 2;(1 0))
(4 2)~(4; 2*1)

/ Adverbs
" ," ,/: ("Now";"is";"the";"time")
L1,/:\\:L2
0+/10 20 30
(1#) each 1001 1002 1004 1003

/ Built-in functions and q-sql
string 42
L1 cross L2
type c
select from t where price=(max;price) fby ([]sym;ex)
ungroup \`p xgroup sp
\`instrument insert (\`g; \`$"Google"; \`$"Internet")

/ Example
/ Example from http://code.kx.com/wiki/Cookbook/CorporateActions
getCAs:{[caTypes]
	/ handles multiplie corporate actions on one date
	t:0!select factor:prd factor by date-1,sym from ca where caType in caTypes;
	t,:update date:1901.01.01,factor:1.0 from ([]sym:distinct t\`sym);
	t:\`date xasc t;
	t:update factor:reverse prds reverse 1 rotate factor by sym from t;
	:update \`g#sym from 0!t;
};

adjust:{[t;caTypes]
	t:0!t;
	factors:enlist 1.0^aj[\`sym\`date;([] date:t\`date;sym:t\`sym);getCAs caTypes]\`factor;
	mc:c where (lower c:cols t) like "*price"; / find columns to multiply
	dc:c where lower[c] like "*size"; / find columns to divide
	:![t;();0b;(mc,dc)!((*),/:mc,\\:factors),((%),/:dc,\\:factors)]; / multiply or divide out the columns
};

/ get the adjustment factors considering all corporate actions
getCAs exec distinct caType from ca

adjust[t;\`dividend] / adjust trades for dividends only

/ / Example
\\
This comment will
continue until the
end of code
`,
	qml: `// Full example
// https://code.qt.io/cgit/qt/qtdeclarative.git/tree/examples/qml/referenceexamples/valuesource/example.qml?h=5.14

import People 1.0
import QtQuick 2.0  // For QColor

BirthdayParty {
	HappyBirthdaySong on announcement { name: "Bob Jones" }

	onPartyStarted: console.log("This party started rockin' at " + time);


	host: Boy {
		name: "Bob Jones"
		shoe { size: 12; color: "white"; brand: "Nike"; price: 90.0 }
	}

	Boy {
		name: "Leo Hodges"
		BirthdayParty.rsvp: "2009-07-06"
		shoe { size: 10; color: "black"; brand: "Reebok"; price: 59.95 }
	}
	Boy {
		name: "Jack Smith"
		shoe { size: 8; color: "blue"; brand: "Puma"; price: 19.95 }
	}
	Girl {
		name: "Anne Brown"
		BirthdayParty.rsvp: "2009-07-01"
		shoe.size: 7
		shoe.color: "red"
		shoe.brand: "Marc Jacobs"
		shoe.price: 699.99
	}

}
`,
	qsharp: `// Full example
namespace Bell {
	open Microsoft.Quantum.Canon;
	open Microsoft.Quantum.Intrinsic;

	operation SetQubitState(desired : Result, target : Qubit) : Unit {
		if desired != M(target) {
			X(target);
		}
	}

	@EntryPoint()
	operation TestBellState(count : Int, initial : Result) : (Int, Int) {

		mutable numOnes = 0;
		use qubit = Qubit();
		for test in 1..count {
			SetQubitState(initial, qubit);
			let res = M(qubit);        

			// Count the number of ones we saw:
			if res == One {
				set numOnes += 1;
			}
		}

		SetQubitState(Zero, qubit); 

		// Return number of times we saw a |0> and number of times we saw a |1>
		Message("Test results (# of 0s, # of 1s): ");
		return (count - numOnes, numOnes);
	}
}
`,
	r: `# Comments
# This is a comment

# Strings
"foo \\"bar\\" baz"
'foo \\'bar\\' baz'

# Full example
# Goal: To make a latex table with results of an OLS regression.

# Get an OLS --
x1 = runif(100)
x2 = runif(100, 0, 2)
y = 2 + 3*x1 + 4*x2 + rnorm(100)
m = lm(y ~ x1 + x2)

# and print it out prettily --
library(xtable)
# Bare --
xtable(m)
xtable(anova(m))

# Better --
print.xtable(xtable(m, caption="My regression",
										label="t:mymodel",
										digits=c(0,3,2,2,3)),
						 type="latex",
						 file="xtable_demo_ols.tex",
						 table.placement = "tp",
						 latex.environments=c("center", "footnotesize"))

print.xtable(xtable(anova(m),
										caption="ANOVA of my regression",
										label="t:anova_mymodel"),
						 type="latex",
						 file="xtable_demo_anova.tex",
						 table.placement = "tp",
						 latex.environments=c("center", "footnotesize"))
`,
	racket: `; Full example
; Source: https://github.com/mbutterick/pollen/blob/master/pollen/private/to-string.rkt

#lang racket/base
(provide (all-defined-out))

(define (to-string x)
	(cond
		[(string? x) x]
		[(or (null? x) (void? x)) ""]
		[(or (symbol? x) (number? x) (path? x) (char? x)) (format "~a" x)]
		;; special handling for procedures, because if a procedure reaches this func,
		;; it usually indicates a failed attempt to use a tag function.
		;; meaning, it's more useful to raise an error.
		[(procedure? x) (error 'pollen "Can't convert procedure ~a to string" x)]
		[else (format "~v" x)]))
`,
	reason: `// Comments
/* This is a comment */

// Strings and characters
"This is a \\"string\\""
'a'
'\\\\'
'\\o123'
'\\x4a'

// Constructors
type response =
	| Yes
	| No
	| PrettyMuch;

// Example
type car = {maker: string, model: string};
type carList =
	| List car carList
	| NoMore;

let chevy = {maker: "Chevy", model: "Suburban"};
let toyota = {maker: "Toyota", model: "Tacoma"};
let myCarList = List chevy (List toyota NoMore);

let hasExactlyTwoCars = fun lst =>
	switch lst {
		| NoMore => false                              /* 0 */
		| List p NoMore => false                       /* 1 */
		| List p (List p2 NoMore) => true              /* 2 */
		| List p (List p2 (List p3 theRest)) => false  /* 3+ */
	};

let justTwo = hasExactlyTwoCars myCarList;  /* true! */
`,
	rego: `# Full example
# Role-based Access Control (RBAC)

# By default, deny requests.
default allow = false

# Allow admins to do anything.
allow {
	user_is_admin
}

# Allow the action if the user is granted permission to perform the action.
allow {
	# Find grants for the user.
	some grant
	user_is_granted[grant]

	# Check if the grant permits the action.
	input.action == grant.action
	input.type == grant.type
}

# user_is_admin is true if...
user_is_admin {

	# for some \`i\`...
	some i

	# "admin" is the \`i\`-th element in the user->role mappings for the identified user.
	data.user_roles[input.user][i] == "admin"
}

# user_is_granted is a set of grants for the user identified in the request.
# The \`grant\` will be contained if the set \`user_is_granted\` for every...
user_is_granted[grant] {
	some i, j

	# \`role\` assigned an element of the user_roles for this user...
	role := data.user_roles[input.user][i]

	# \`grant\` assigned a single grant from the grants list for 'role'...
	grant := data.role_grants[role][j]
}
`,
	renpy: `# Comments
# This is a comment

# Strings
"foo \\"bar\\" baz"
'foo \\'bar\\' baz'
""" "Multi-line" strings
are supported."""
''' 'Multi-line' strings
are supported.'''

# Python
class Dog:

	tricks = []             # mistaken use of a class variable

	def __init__(self, name):
		self.name = name

	def add_trick(self, trick):
		self.tricks.append(trick)

# Properties
style my_text is text:
	size 40
	font "gentium.ttf"

# Configuration
init -1:
	python hide:

		## Should we enable the use of developer tools? This should be
		## set to False before the game is released, so the user can't
		## cheat using developer tools.

		config.developer = True

		## These control the width and height of the screen.

		config.screen_width = 800
		config.screen_height = 600

		## This controls the title of the window, when Ren'Py is
		## running in a window.

		config.window_title = u"The Question"

# Full example
# Declare images used by this game.
image bg lecturehall = "lecturehall.jpg"
image bg uni = "uni.jpg"
image bg meadow = "meadow.jpg"
image bg club = "club.jpg"

image sylvie normal = "sylvie_normal.png"
image sylvie giggle = "sylvie_giggle.png"
image sylvie smile = "sylvie_smile.png"
image sylvie surprised = "sylvie_surprised.png"

image sylvie2 normal = "sylvie2_normal.png"
image sylvie2 giggle = "sylvie2_giggle.png"
image sylvie2 smile = "sylvie2_smile.png"
image sylvie2 surprised = "sylvie2_surprised.png"

# Define characters used by this game.
define s = Character('Sylvie', color="#c8ffc8")
define m = Character('Me', color="#c8c8ff")


# The game starts here.
label start:

	$ bl_game = False

	play music "illurock.ogg"

	scene bg lecturehall
	with fade

	"Well, professor Eileen's lecture was interesting."
	"But to be honest, I couldn't concentrate on it very much."
	"I had a lot of other thoughts on my mind."
	"And they all ended up with a question."
	"A question, I've been meaning to ask someone."

	scene bg uni
	with fade

	"When we came out of the university, I saw her."

	show sylvie normal
	with dissolve

	"She was a wonderful person."
	"I've known her ever since we were children."
	"And she's always been a good friend."
	"But..."
	"Recently..."
	"I think..."
	"... that I wanted more."
	"More just talking... more than just walking home together when our classes ended."
	"And I decided..."

	menu:

		"... to ask her right away.":

			jump rightaway

		"... to ask her later.":

			jump later
`,
	rescript: `// Comments
/* This is a comment */
// Another comment

// Let bindings
let name = "Alonzo Church"
let message = \`Hello \${name}\`
let message2 = \`Hello \${person.name}\`
let result = \`Testing => \${Module.Another.value}\`
let value = 1
let result = 1 + 1
let langs = ["ReScript", "JavaScript"]
let person = ("Alonzo", 32)

// Type declarations & Functions
type role = | Admin | Editor | Viewer 
type numeric = #1 | #2 | #3
type normal = #Poly | #Variant
type myPolyVar = [ #"poly-variant" | #"test-chars" ]

type person = {
	name: string,
	age: int,
	role: role
}

type record = {
	"field": string
}

let sum = (a, b) => a + b
let sum2 = (a:int, b: int) => a + b

// Modules, JSX & Components
%%raw(\`\`)
module Button = {
	@react.component
	let make = (~count: int) =>{
		let times = switch count {
		| 1 => "once"
		| 2 => "twice"
		| n => Belt.Int.toString(n) ++ " times"
		}
		let msg = "Click me " ++ times

	<button onClick={Js.log}>{msg->React.string}</button>;
	}
}

@react.component
let make = () => <MyModule.Button count=1 />
`,
	rest: `.. Titles
===============
 Section Title
===============

---------------
 Section Title
---------------

Section Title
=============

Section Title
-------------

Section Title
\`\`\`\`\`\`\`\`\`\`\`\`\`

Section Title
'''''''''''''

Section Title
.............

Section Title
~~~~~~~~~~~~~

Section Title
*************

Section Title
+++++++++++++

Section Title
^^^^^^^^^^^^^

.. Lists
- This is the first bullet list item.
- This is the first paragraph in the second item in the list.

	This is the second paragraph in the second item in the list.

	- This is a sublist.  The bullet lines up with the left edge of
		the text blocks above.

- This is the third item of the main list.

This paragraph is not part of the list.

1. Item 1 initial text.

	 a) Item 1a.
	 b) Item 1b.

2. a) Item 2a.
	 b) Item 2b.

.. Field lists
:Date: 2001-08-16
:Version: 1
:Authors: - Me
					- Myself
					- I
:Indentation: Since the field marker may be quite long, the second
	 and subsequent lines of the field body do not have to line up
	 with the first line, but they must be indented relative to the
	 field name marker, and they must line up with each other.
:Parameter i: integer

.. Option lists
-a         Output all.
-b         Output both (this description is
					 quite long).
-c arg     Output just arg.
--long     Output all day long.

-p         This option has two paragraphs in the description.
					 This is the first.

					 This is the second.  Blank lines may be omitted between
					 options (as above) or left in (as here and below).

--very-long-option  A VMS-style option.  Note the adjustment for
										the required two spaces.

--an-even-longer-option
					 The description can also start on the next line.

-2, --two  This option has two variants.

-f FILE, --file=FILE  These two options are synonyms; both have
											arguments.

/V         A VMS/DOS-style option.

.. Literal blocks
::

	for a in [5,4,3,2,1]:   # this is program code, shown as-is
		print a
	print "it's..."
	# a literal block continues until the indentation ends

John Doe wrote::

>> *Great* idea!
>
> Why didn't I think of that?

You just did!  ;-)

.. Line blocks
| Lend us a couple of bob till Thursday.
| I'm absolutely skint.
| But I'm expecting a postal order and I can pay you back
	as soon as it comes.
| Love, Ewan.

Take it away, Eric the Orchestra Leader!

	| A one, two, a one two three four
	|
	| Half a bee, philosophically,
	|     must, *ipso facto*, half not be.
	| But half the bee has got to be,
	|     *vis a vis* its entity.  D'you see?
	|
	| But can a bee be said to be
	|     or not to be an entire bee,
	|         when half the bee is not a bee,
	|             due to some ancient injury?
	|
	| Singing...

.. Grid tables and simple tables
+------------------------+------------+----------+----------+
| Header row, column 1   | Header 2   | Header 3 | Header 4 |
| (header rows optional) |            |          |          |
+========================+============+==========+==========+
| body row 1, column 1   | column 2   | column 3 | column 4 |
+------------------------+------------+----------+----------+
| body row 2             | Cells may span columns.          |
+------------------------+------------+---------------------+
| body row 3             | Cells may  | - Table cells       |
+------------------------+ span rows. | - contain           |
| body row 4             |            | - body elements.    |
+------------------------+------------+---------------------+

	+--------------+----------+-----------+-----------+
	| row 1, col 1 | column 2 | column 3  | column 4  |
	+--------------+----------+-----------+-----------+
	| row 2        |                                  |
	+--------------+----------+-----------+-----------+
	| row 3        |          |           |           |
	+--------------+----------+-----------+-----------+

=====  =====  =======
	A      B    A and B
=====  =====  =======
False  False  False
True   False  False
False  True   False
True   True   True
=====  =====  =======

	=====  =====  ======
		 Inputs     Output
	------------  ------
		A      B    A or B
	=====  =====  ======
	False  False  False
	True   False  True
	False  True   True
	True   True   True
	=====  =====  ======

.. Footnotes and links
.. [1] Body elements go here.

If [#note]_ is the first footnote reference, it will show up as
"[1]".  We can refer to it again as [#note]_ and again see
"[1]".  We can also refer to it as note_ (an ordinary internal
hyperlink reference).

.. [#note] This is the footnote labeled "note".

Here is a symbolic footnote reference: [*]_.

.. [*] This is the footnote.

[2]_ will be "2" (manually numbered),
[#]_ will be "3" (anonymous auto-numbered), and
[#label]_ will be "1" (labeled auto-numbered).

.. [2] This footnote is labeled manually, so its number is fixed.

.. [#label] This autonumber-labeled footnote will be labeled "1".
	 It is the first auto-numbered footnote and no other footnote
	 with label "1" exists.  The order of the footnotes is used to
	 determine numbering, not the order of the footnote references.

.. [#] This footnote will be labeled "3".  It is the second
	 auto-numbered footnote, but footnote label "2" is already used.

Here is a citation reference: [CIT2002]_.

.. [CIT2002] This is the citation.  It's just like a footnote,
	 except the label is textual.

.. _hyperlink-name: link-block

.. __: anonymous-hyperlink-target-link-block

__ anonymous-hyperlink-target-link-block

Clicking on this internal hyperlink will take us to the target_
below.

.. _target:

The hyperlink target above points to this paragraph.

.. Directives
.. image:: mylogo.jpeg

.. figure:: larch.png

	 The larch.

.. note:: This is a paragraph

	 - Here is a bullet list.

.. figure:: picture.png
	 :scale: 50 %
	 :alt: map to buried treasure

	 This is the caption of the figure (a simple paragraph).

	 The legend consists of all elements after the caption.  In this
	 case, the legend consists of this paragraph and the following
	 table:

	 +-----------------------+-----------------------+
	 | Symbol                | Meaning               |
	 +=======================+=======================+
	 | .. image:: tent.png   | Campground            |
	 +-----------------------+-----------------------+
	 | .. image:: waves.png  | Lake                  |
	 +-----------------------+-----------------------+
	 | .. image:: peak.png   | Mountain              |
	 +-----------------------+-----------------------+

.. Substitutions
The |biohazard| symbol must be used on containers used to
dispose of medical waste.

.. |biohazard| image:: biohazard.png

|Michael| and |Jon| are our widget-wranglers.

.. |Michael| user:: mjones
.. |Jon|     user:: jhl

West led the |H| 3, covered by dummy's |H| Q, East's |H| K,
and trumped in hand with the |S| 2.

.. |H| image:: /images/heart.png
	 :height: 11
	 :width: 11
.. |S| image:: /images/spade.png
	 :height: 11
	 :width: 11

* |Red light| means stop.
* |Green light| means go.
* |Yellow light| means go really fast.

.. |Red light|    image:: red_light.png
.. |Green light|  image:: green_light.png
.. |Yellow light| image:: yellow_light.png

.. Comments
.. This is a comment

..
	 _so: is this!

..
	 [and] this!

..
	 this:: too!

..
	 |even| this:: !

.. Inline markup
This is *emphasized text*.
This is **strong text**.
This is \`interpreted text\`.
:role:\`interpreted text\`
\`interpreted text\`:role:
This text is an example of \`\`inline literals\`\`.
The regular expression \`\`[+-]?(\\d+(\\.\\d*)?|\\.\\d+)\`\` matches
floating-point numbers (without exponents).

See the \`Python home page <http://www.python.org>\`_ for info.

Oh yes, the _\`Norwegian Blue\`.  What's, um, what's wrong with it?
`,
	rip: `# Comments
# This is a comment

# Strings
"foo \\"bar\\" baz"
'foo \\'bar\\' baz'

# Regex
regular_expression = /abc/

# Symbols
string_symbol = :rip
`,
	roboconf: `# Full example
ApacheServer {
	# Apache instances will be deployed by Roboconf's Puppet extension
	installer: puppet;

	# Web applications could be deployed over this Apache server
	children: My-Dash-Board, Marketing-Suite;

	# Properties exported by this component.
	# 'port' should have a default value, or we will have to set it when we create an instance.
	exports: port = 19099;

	# 'ip' is a special variable. It will be updated at runtime by a Roboconf agent.
	exports: ip;

	# Other components properties that this server needs to have so that it can start.
	imports: LB.port (optional), LB.ip (optional);

	# Here, the Apache may also be notified about components instances of type LB.
	# The imports are marked as optional. It means that if there is no LB instance, an
	# Apache instance will be able to start anyway.
	#
	# If the import was not optional, e.g.
	#
	# imports: LB.port, LB.ip;
	# or even
	# imports: LB.port (optional), LB.ip;
	#
	# ... then an Apache instance would need at least one LB instance somewhere.

	# Imports may also reference variables from other applications
	imports: external Lamp.lb-ip;
}

facet LoadBalanced {
	exports: ip, port;  # Define we export two variables.
}

instance of VM {

	# This will create 5 VM instances, called VM 1, VM 2, VM3, VM 4 and VM 5.
	name: VM ;  # Yes, there is a space at the end... :)
	count: 5;

	# On every VM instance, we will deploy...
	instance of Tomcat {
		name: Tomcat;
	}
}
`,
	qore: `// Full example
#!/usr/bin/env qore

# database test script
# databases users must be able to create and destroy tables and procedures, etc
# in order to execute all tests

%require-our
%enable-all-warnings

our ($o, $errors, $test_count);

const opts =
	( "help"    : "h,help",
		"host"    : "H,host=s",
		"pass"    : "p,pass=s",
		"db"      : "d,db=s",
		"user"    : "u,user=s",
		"type"    : "t,type=s",
		"enc"     : "e,encoding=s",
		"verbose" : "v,verbose:i+",
		"leave"   : "l,leave"
 );

sub usage()
{
	printf("usage: %s [options]
 -h,--help          this help text
 -u,--user=ARG      set username
 -p,--pass=ARG      set password
 -d,--db=ARG        set database name
 -e,--encoding=ARG  set database character set encoding (i.e. \\"utf8\\")
 -H,--host=ARG      set hostname (for MySQL and PostgreSQL connections)
 -t,--type          set database driver (default mysql)
 -v,--verbose       more v's = more information
 -l,--leave         leave test tables in schema at end\\n",
		 basename($ENV."_"));
	exit();
}

const object_map =
	( "oracle" :
		( "tables" : ora_tables ),
		"mysql"  :
		( "tables" : mysql_tables ),
		"pgsql"  :
		( "tables" : pgsql_tables ),
		"sybase" :
		( "tables" : syb_tables,
		"procs"  : sybase_procs ),
		"freetds"  :
		( "tables" : freetds_sybase_tables,
		"procs"  : sybase_procs ) );

const ora_tables = (
	"family" : "create table family (
		family_id int not null,
		name varchar2(80) not null
	)",
	"people" : "create table people (
		person_id int not null,
		family_id int not null,
		name varchar2(250) not null,
		dob date not null
	)",
	"attributes" : "create table attributes (
		person_id int not null,
		attribute varchar2(80) not null,
		value varchar2(160) not null
	)"
);

const mysql_tables = (
	"family" : "create table family (
		family_id int not null,
		name varchar(80) not null
	) type = innodb",
	"people" : "create table people (
		person_id int not null,
		family_id int not null,
		name varchar(250) not null,
		dob date not null
	) type = innodb",
		"attributes" : "create table attributes (
		person_id int not null,
		attribute varchar(80) not null,
		value varchar(160) not null
	) type = innodb"
);

const pgsql_tables = (
	"family" : "create table family (
		family_id int not null,
		name varchar(80) not null )",
	"people" : "create table people (
		person_id int not null,
		family_id int not null,
		name varchar(250) not null,
		dob date not null )",
	"attributes" : "create table attributes (
		person_id int not null,
		attribute varchar(80) not null,
		value varchar(160) not null)",
	"data_test" : "create table data_test (
		int2_f smallint not null,
		int4_f integer not null,
		int8_f int8 not null,
		bool_f boolean not null,

		float4_f real not null,
		float8_f double precision not null,

		number_f numeric(16,3) not null,
		money_f money not null,

		text_f text not null,
		varchar_f varchar(40) not null,
		char_f char(40) not null,
		name_f name not null,

		date_f date not null,
		abstime_f abstime not null,
		reltime_f reltime not null,
		interval_f interval not null,
		time_f time not null,
		timetz_f time with time zone not null,
		timestamp_f timestamp not null,
		timestamptz_f timestamp with time zone not null,
		tinterval_f tinterval not null,

		bytea_f bytea not null
		--bit_f bit(11) not null,
		--varbit_f bit varying(11) not null
	)"
);

const syb_tables = (
	"family" : "create table family (
		family_id int not null,
		name varchar(80) not null
	)",
	"people" : "create table people (
		person_id int not null,
		family_id int not null,
		name varchar(250) not null,
		dob date not null
	)",
	"attributes" : "create table attributes (
		person_id int not null,
		attribute varchar(80) not null,
		value varchar(160) not null
	)",
	"data_test" : "create table data_test (
		null_f char(1) null,

		varchar_f varchar(40) not null,
		char_f char(40) not null,
		unichar_f unichar(40) not null,
		univarchar_f univarchar(40) not null,
		text_f text not null,
		unitext_f unitext not null, -- note that unitext is stored as 'image'

		bit_f bit not null,
		tinyint_f tinyint not null,
		smallint_f smallint not null,
		int_f int not null,
		int_f2 int not null,

		decimal_f decimal(10,4) not null,

		float_f float not null,     -- 8-bytes
		real_f real not null,       -- 4-bytes
		money_f money not null,
		smallmoney_f smallmoney not null,

		date_f date not null,
		time_f time not null,
		datetime_f datetime not null,
		smalldatetime_f smalldatetime not null,

		binary_f binary(4) not null,
		varbinary_f varbinary(4) not null,
		image_f image not null
	)"
);

const sybase_procs = (
	"find_family" :
		"create procedure find_family @name varchar(80)
		as
		select * from family where name = @name
		commit -- to maintain transaction count
		",
	"get_values" :
		"create procedure get_values @string varchar(80) output, @int int output
		as
		select @string = 'hello there'
		select @int = 150
		commit -- to maintain transaction count
		",
	"get_values_and_select" :
		"create procedure get_values_and_select @string varchar(80) output, @int int output
		as
		select @string = 'hello there'
		select @int = 150
		select * from family where family_id = 1
		commit -- to maintain transaction count
		",
	"get_values_and_multiple_select" :
		"create procedure get_values_and_multiple_select @string varchar(80) output, @int int output
		as
		select @string = 'hello there'
		select @int = 150
		select * from family where family_id = 1
		select * from people where person_id = 1
		commit -- to maintain transaction count
		",
	"just_select" :
		"create procedure just_select
		as
		select * from family where family_id = 1
		commit -- to maintain transaction count
		",
	"multiple_select" :
		"create procedure multiple_select
		as
		select * from family where family_id = 1
		select * from people where person_id = 1
		commit -- to maintain transaction count
		"
);

const freetds_sybase_tables = (
	"family" : "create table family (
		family_id int not null,
		name varchar(80) not null
	)",
	"people" : "create table people (
		person_id int not null,
		family_id int not null,
		name varchar(250) not null,
		dob date not null
	)",
	"attributes" : "create table attributes (
		person_id int not null,
		attribute varchar(80) not null,
		value varchar(160) not null
	)",
	"data_test" : "create table data_test (
		null_f char(1) null,

		varchar_f varchar(40) not null,
		char_f char(40) not null,
		text_f text not null,
		unitext_f unitext not null, -- note that unitext is stored as 'image'

		bit_f bit not null,
		tinyint_f tinyint not null,
		smallint_f smallint not null,
		int_f int not null,
		int_f2 int not null,

		decimal_f decimal(10,4) not null,

		float_f float not null,     -- 8-bytes
		real_f real not null,       -- 4-bytes
		money_f money not null,
		smallmoney_f smallmoney not null,

		date_f date not null,
		time_f time not null,
		datetime_f datetime not null,
		smalldatetime_f smalldatetime not null,

		binary_f binary(4) not null,
		varbinary_f varbinary(4) not null,
		image_f image not null
	)"
);

const freetds_mssql_tables = (
	"family" : "create table family (
		family_id int not null,
		name varchar(80) not null
	)",
	"people" : "create table people (
		person_id int not null,
		family_id int not null,
		name varchar(250) not null,
		dob datetime not null
	)",
	"attributes" : "create table attributes (
		person_id int not null,
		attribute varchar(80) not null,
		value varchar(160) not null
	)",
	"data_test" : "create table data_test (
		null_f char(1) null,

		varchar_f varchar(40) not null,
		char_f char(40) not null,
		text_f text not null,

			bit_f bit not null,
		tinyint_f tinyint not null,
		smallint_f smallint not null,
		int_f int not null,
			int_f2 int not null,

		decimal_f decimal(10,4) not null,

		float_f float not null,     -- 8-bytes
		real_f real not null,       -- 4-bytes
		money_f money not null,
		smallmoney_f smallmoney not null,

		datetime_f datetime not null,
		smalldatetime_f smalldatetime not null,

		binary_f binary(4) not null,
		varbinary_f varbinary(4) not null,
		image_f image not null
	)"
);

sub parse_command_line()
{
	my $g = new GetOpt(opts);
	$o = $g.parse(\\$ARGV);
	if ($o.help)
		usage();

	if (!strlen($o.db))
	{
		stderr.printf("set the login parameters with -u,-p,-d, etc (-h for help)\\n");
		exit(1);
	}
	if (elements $ARGV)
	{
		stderr.printf("excess arguments on command-line (%n): -h for help\\n", $ARGV);
		exit(1);
	}
	if (!strlen($o.type))
		$o.type = "mysql";
}

sub create_datamodel($db)
{
	drop_test_datamodel($db);

	my $driver = $db.getDriverName();
	# create tables
	my $tables = object_map.$driver.tables;
	if ($driver == "freetds")
	if ($db.is_sybase)
		$tables = freetds_sybase_tables;
	else
		$tables = freetds_mssql_tables;

	foreach my $table in (keys $tables)
	{
		tprintf(2, "creating table %n\\n", $table);
		$db.exec($tables.$table);
	}

	# create procedures if any
	foreach my $proc in (keys object_map.$driver.procs)
	{
		tprintf(2, "creating procedure %n\\n", $proc);
		$db.exec(object_map.$driver.procs.$proc);
	}

	# create functions if any
	foreach my $func in (keys object_map.$driver.funcs)
	{
		tprintf(2, "creating function %n\\n", $func);
		$db.exec(object_map.$driver.funcs.$func);
	}

	$db.exec("insert into family values ( 1, 'Smith' )");
	$db.exec("insert into family values ( 2, 'Jones' )");

	# we insert the dates here using binding by value so we don't have
	# to worry about each database's specific date format
	$db.exec("insert into people values ( 1, 1, 'Arnie', %v)", 1983-05-13);
	$db.exec("insert into people values ( 2, 1, 'Sylvia', %v)", 1994-11-10);
	$db.exec("insert into people values ( 3, 1, 'Carol', %v)", 2003-07-23);
	$db.exec("insert into people values ( 4, 1, 'Bernard', %v)", 1979-02-27);
	$db.exec("insert into people values ( 5, 1, 'Isaac', %v)", 2000-04-04);
	$db.exec("insert into people values ( 6, 2, 'Alan', %v)", 1992-06-04);
	$db.exec("insert into people values ( 7, 2, 'John', %v)", 1995-03-23);

	$db.exec("insert into attributes values ( 1, 'hair', 'blond' )");
	$db.exec("insert into attributes values ( 1, 'eyes', 'hazel' )");
	$db.exec("insert into attributes values ( 2, 'hair', 'blond' )");
	$db.exec("insert into attributes values ( 2, 'eyes', 'blue' )");
	$db.exec("insert into attributes values ( 3, 'hair', 'brown' )");
	$db.exec("insert into attributes values ( 3, 'eyes', 'grey')");
	$db.exec("insert into attributes values ( 4, 'hair', 'brown' )");
	$db.exec("insert into attributes values ( 4, 'eyes', 'brown' )");
	$db.exec("insert into attributes values ( 5, 'hair', 'red' )");
	$db.exec("insert into attributes values ( 5, 'eyes', 'green' )");
	$db.exec("insert into attributes values ( 6, 'hair', 'black' )");
	$db.exec("insert into attributes values ( 6, 'eyes', 'blue' )");
	$db.exec("insert into attributes values ( 7, 'hair', 'brown' )");
	$db.exec("insert into attributes values ( 7, 'eyes', 'brown' )");
	$db.commit();
}

sub drop_test_datamodel($db)
{
	my $driver = $db.getDriverName();
	# drop the tables and ignore exceptions
	# the commits are needed for databases like postgresql, where errors will prohibit and further
	# actions from being taken on the Datasource
	foreach my $table in (keys object_map.$driver.tables)
	try {
		$db.exec("drop table " + $table);
		$db.commit();
		tprintf(2, "dropped table %n\\n", $table);
	}
		catch ()
	{
		$db.commit();
	}

	# drop procedures and ignore exceptions
	foreach my $proc in (keys object_map.$driver.procs)
	{
		my $cmd = object_map.$driver.drop_proc_cmd;
		if (!exists $cmd)
			$cmd = "drop procedure";
		try {
			$db.exec($cmd + " " + $proc);
			$db.commit();
			tprintf(2, "dropped procedure %n\\n", $proc);
		}
		catch ()
		{
			$db.commit();
		}
	}

	# drop functions and ignore exceptions
	foreach my $func in (keys object_map.$driver.funcs)
	{
		my $cmd = object_map.$driver.drop_func_cmd;
		if (!exists $cmd)
			$cmd = "drop function";
		try {
			$db.exec($cmd + " " + $func);
			$db.commit();
			tprintf(2, "dropped function %n\\n", $func);
		}
		catch ()
		{
			$db.commit();
		}
	}
}

sub getDS()
{
	my $ds = new Datasource($o.type, $o.user, $o.pass, $o.db, $o.enc);
	if (strlen($o.host))
	$ds.setHostName($o.host);
	return $ds;
}

sub tprintf($v, $msg)
{
	if ($v <= $o.verbose)
	vprintf($msg, $argv);
}

sub test_value($v1, $v2, $msg)
{
	++$test_count;
	if ($v1 == $v2)
		tprintf(1, "OK: %s test\\n", $msg);
	else
	{
		tprintf(0, "ERROR: %s test failed! (%n != %n)\\n", $msg, $v1, $v2);
		$errors++;
	}
}

const family_hash = (
	"Jones" : (
		"people" : (
		"John" : (
			"dob" : 1995-03-23,
			"eyes" : "brown",
			"hair" : "brown" ),
		"Alan" : (
			"dob" : 1992-06-04,
			"eyes" : "blue",
			"hair" : "black" ) ) ),
	"Smith" : (
	"people" : (
		"Arnie" : (
		"dob" : 1983-05-13,
		"eyes" : "hazel",
		"hair" : "blond" ),
		"Carol" : (
		"dob" : 2003-07-23,
		"eyes" : "grey",
		"hair" : "brown" ),
		"Isaac" : (
		"dob" : 2000-04-04,
		"eyes" : "green",
		"hair" : "red" ),
		"Bernard" : (
		"dob" : 1979-02-27,
		"eyes" : "brown",
		"hair" : "brown" ),
		"Sylvia" : (
		"dob" : 1994-11-10,
		"eyes" : "blue",
		"hair" : "blond" ) ) ) );

sub context_test($db)
{
	# first we select all the data from the tables and then use
	# context statements to order the output hierarchically

	# context statements are most useful when a set of queries can be executed once
	# and the results processed many times by creating "views" with context statements

	my $people = $db.select("select * from people");
	my $attributes = $db.select("select * from attributes");

	my $today = format_date("YYYYMMDD", now());

	# in this test, we create a big hash structure out of the queries executed above
	# and compare it at the end to the expected result

	# display each family sorted by family name
	my $fl;
	context family ($db.select("select * from family")) sortBy (%name)
	{
		my $pl;
		tprintf(2, "Family %d: %s\\n", %family_id, %name);

		# display people, sorted by eye color, descending
		context people ($people)
			sortDescendingBy (find %value in $attributes
				where (%attribute == "eyes"
				&& %person_id == %people:person_id))
		where (%family_id == %family:family_id)
		{
			my $al;
			tprintf(2, "  %s, born %s\\n", %name, format_date("Month DD, YYYY", %dob));
			context ($attributes) sortBy (%attribute) where (%person_id == %people:person_id)
			{
				$al.%attribute = %value;
				tprintf(2, "    has %s %s\\n", %value, %attribute);
			}
			# leave out the ID fields and name from hash under name; subtracting a
			# string from a hash removes that key from the result
			# this is "doing it the hard way", there is only one key left,
			# "dob", then attributes are added directly into the person hash
			$pl.%name = %% - "family_id" - "person_id" - "name" + $al;
		}
		# leave out family_id and name fields (leaving an empty hash)
		$fl.%name = %% - "family_id" - "name" + ( "people" : $pl );
	}

	# test context ordering
	test_value(keys $fl, ("Jones", "Smith"), "first context");
	test_value(keys $fl.Smith.people, ("Arnie", "Carol", "Isaac", "Bernard", "Sylvia"), "second context");
	# test entire context value
	test_value($fl, family_hash, "third context");
}


sub test_timeout($db, $c)
{
	$db.setTransactionLockTimeout(1ms);
	try {
		# this should cause a TRANSACTION-LOCK-TIMEOUT exception to be thrown
		$db.exec("insert into family values (3, 'Test')\\n");
		test_value(True, False, "transaction timeout");
		$db.exec("delete from family where name = 'Test'");
	}
	catch ($ex)
	{
		test_value(True, True, "transaction timeout");
	}
	# signal parent thread to continue
	$c.dec();
}

sub transaction_test($db)
{
	my $ndb = getDS();
	my $r;
	tprintf(2, "db.autocommit=%N, ndb.autocommit=%N\\n", $db.getAutoCommit(), $ndb.getAutoCommit());

	# first, we insert a new row into "family" but do not commit it
	my $rows = $db.exec("insert into family values (3, 'Test')\\n");
	if ($rows !== 1)
		printf("FAILED INSERT, rows=%N\\n", $rows);

	# now we verify that the new row is not visible to the other datasource
	# unless it's a sybase/ms sql server datasource, in which case this would deadlock :-(
	if ($o.type != "sybase" && $o.type != "freetds")
	{
		$r = $ndb.selectRow("select name from family where family_id = 3").name;
		test_value($r, NOTHING, "first transaction");
	}

	# now we verify that the new row is visible to the inserting datasource
	$r = $db.selectRow("select name from family where family_id = 3").name;
	test_value($r, "Test", "second transaction");

	# test datasource timeout
	# this Counter variable will allow the parent thread to sleep
	# until the child thread times out
	my $c = new Counter(1);
	background test_timeout($db, $c);

	# wait for child thread to time out
	$c.waitForZero();

	# now, we commit the transaction
	$db.commit();

	# now we verify that the new row is visible in the other datasource
	$r = $ndb.selectRow("select name from family where family_id = 3").name;
	test_value($r, "Test", "third transaction");

	# now we delete the row we inserted (so we can repeat the test)
	$r = $ndb.exec("delete from family where family_id = 3");
	test_value($r, 1, "delete row count");
	$ndb.commit();
}

sub oracle_test()
{
}

# here we use a little workaround for modules that provide functions,
# namespace additions (constants, classes, etc) needed by test functions
# at parse time.  To avoid parse errors (as database modules are loaded
# in this script at run-time when the Datasource class is instantiated)
# we use a Program object that we parse and run on demand to return the
# value required
sub get_val($code)
{
	my $p = new Program();

	my $str = sprintf("return %s;", $code);
	$p.parse($str, "code");
	return $p.run();
}

sub pgsql_test($db)
{
	my $args = ( "int2_f"          : 258,
		 "int4_f"          : 233932,
		 "int8_f"          : 239392939458,
		 "bool_f"          : True,
		 "float4_f"        : 21.3444,
		 "float8_f"        : 49394.23423491,
		 "number_f"        : get_val("pgsql_bind(PG_TYPE_NUMERIC, '7235634215.3250')"),
		 "money_f"         : get_val("pgsql_bind(PG_TYPE_CASH, \\"400.56\\")"),
		 "text_f"          : 'some text  ',
		 "varchar_f"       : 'varchar ',
		 "char_f"          : 'char text',
		 "name_f"          : 'name',
		 "date_f"          : 2004-01-05,
		 "abstime_f"       : 2005-12-03T10:00:01,
		 "reltime_f"       : 5M + 71D + 19h + 245m + 51s,
		 "interval_f"      : 6M + 3D + 2h + 45m + 15s,
		 "time_f"          : 11:35:00,
		 "timetz_f"        : get_val("pgsql_bind(PG_TYPE_TIMETZ, \\"11:38:21 CST\\")"),
		 "timestamp_f"     : 2005-04-01T11:35:26,
		 "timestamptz_f"   : 2005-04-01T11:35:26.259,
		 "tinterval_f"     : get_val("pgsql_bind(PG_TYPE_TINTERVAL, '[\\"May 10, 1947 23:59:12\\" \\"Jan 14, 1973 03:14:21\\"]')"),
		 "bytea_f"         : <bead>
		 #bit_f             :
		 #varbit_f          :
	);

	$db.vexec("insert into data_test values (%v, %v, %v, %v, %v, %v, %v, %v, %v, %v, %v, %v, %v, %v, %v, %v, %v, %v, %v, %v, %v, %v)", hash_values($args));

	my $q = $db.selectRow("select * from data_test");
	if ($o.verbose > 1)
	foreach my $k in (keys $q)
		tprintf(2, " %-16s= %-10s %N\\n", $k, type($q.$k), $q.$k);

	# fix values where we know the return type is different
	$args.money_f = 400.56;
	$args.timetz_f = 11:38:21;
	$args.tinterval_f = '["1947-05-10 21:59:12" "1973-01-14 02:14:21"]';
	$args.number_f = "7235634215.3250";
	$args.reltime_f = 19177551s;
	$args.interval_f = 6M + 3D + 9915s;

	# rounding errors can happen in float4
	$q.float4_f = round($q.float4_f);
	$args.float4_f = round($args.float4_f);

	# remove values where we know they won't match
	# abstime and timestamptz are converted to GMT by the server
	delete $q.abstime_f;
	delete $q.timestamptz_f;

	# compare each value
	foreach my $k in (keys $q)
		test_value($q.$k, $args.$k, sprintf("%s bind and retrieve", $k));

	$db.commit();
}

sub mysql_test()
{
}

const family_q = ( "family_id" : 1,
			 "name" : "Smith" );
const person_q = ( "person_id" : 1,
			 "family_id" : 1,
			 "name" : "Arnie",
			 "dob" : 1983-05-13 );
const params = ( "string" : "hello there",
		 "int" : 150 );

sub sybase_test($db)
{
	# simple stored proc test, bind by name
	my $x = $db.exec("exec find_family %v", "Smith");
	test_value($x, ("name": list("Smith"), "family_id" : list(1)), "simple stored proc");

	# stored proc execute with output params
	$x = $db.exec("declare @string varchar(40), @int int
	exec get_values :string output, :int output");
	test_value($x, params + ("rowcount":1), "get_values");

	# we use Datasource::selectRows() in the following queries because we
	# get hash results instead of a hash of lists as with exec in the queries
	# normally we should not use selectRows to execute a stored procedure,
	# as the Datasource::selectRows() method will not grab the transaction lock,
	# but we already called Datasource::exec() above, so we have it already.
	# the other alternative would be to call Datasource::beginTransaction() before
	# Datasource::selectRows()

	# simple stored proc test, bind by name, returns hash
	$x = $db.selectRows("exec find_family %v", "Smith");
	test_value($x, family_q, "simple stored proc");

	# stored proc execute with output params and select results
	$x = $db.selectRows("declare @string varchar(40), @int int
	exec get_values_and_select :string output, :int output");
	test_value($x, ("query":family_q,"params":params), "get_values_and_select");

	# stored proc execute with output params and multiple select results
	$x = $db.selectRows("declare @string varchar(40), @int int
	exec get_values_and_multiple_select :string output, :int output");
	test_value($x, ("query":("query0":family_q,"query1":person_q),"params":params), "get_values_and_multiple_select");

	# stored proc execute with just select results
	$x = $db.selectRows("exec just_select");
	test_value($x, family_q, "just_select");

	# stored proc execute with multiple select results
	$x = $db.selectRows("exec multiple_select");
	test_value($x, ("query0":family_q,"query1":person_q), "multiple_select");

	my $args = ( "null_f"          : NULL,
		 "varchar_f"       : "varchar",
		 "char_f"          : "char",
		 "unichar_f"       : "unichar",
		 "univarchar_f"    : "univarchar",
		 "text_f"          : "test",
		 "unitext_f"       : "test",
		 "bit_f"           : True,
		 "tinyint_f"       : 55,
		 "smallint_f"      : 4285,
		 "int_f"           : 405402,
		 "int_f2"          : 214123498,
		 "decimal_f"       : 500.1231,
		 "float_f"         : 23443.234324234,
		 "real_f"          : 213.123,
		 "money_f"         : 3434234250.2034,
		 "smallmoney_f"    : 211100.1012,
		 "date_f"          : 2007-05-01,
			 "time_f"          : 10:30:01,
		 "datetime_f"      : 3459-01-01T11:15:02.250,
		 "smalldatetime_f" : 2007-12-01T12:01:00,
		 "binary_f"        : <0badbeef>,
		 "varbinary_f"     : <feedface>,
		 "image_f"         : <cafebead> );

	# insert data
	my $rows = $db.vexec("insert into data_test values (%v, %v, %v, %v, %v, %v, %v, %v, %v, %v, %v, %d, %v, %v, %v, %v, %v, %v, %v, %v, %v, %v, %v, %v)", hash_values($args));

	my $q = $db.selectRow("select * from data_test");
	if ($o.verbose > 1)
	foreach my $k in (keys $q)
		tprintf(2, " %-16s= %-10s %N\\n", $k, type($q.$k), $q.$k);

	# remove values where we know they won't match
	# unitext_f is returned as IMAGE by the server
	delete $q.unitext_f;
	delete $args.unitext_f;
	# rounding errors can happen in real
	$q.real_f = round($q.real_f);
	$args.real_f = round($args.real_f);

	# compare each value
	foreach my $k in (keys $q)
		test_value($q.$k, $args.$k, sprintf("%s bind and retrieve", $k));

	$db.commit();
}

sub freetds_test($db)
{
	# simple stored proc test, bind by name
	my $x = $db.exec("exec find_family %v", "Smith");
	test_value($x, ("name": list("Smith"), "family_id" : list(1)), "simple stored proc");

	# we cannot retrieve parameters from newer SQL Servers with the approach we use;
	# Microsoft changed the handling of the protocol and require us to use RPC calls,
	# this will be implemented in the next version of qore where the "freetds" driver will
	# be able to add custom methods to the Datasource class.  For now, we skip these tests

	if ($db.is_sybase)
	{
		$x = $db.exec("declare @string varchar(40), @int int
		exec get_values :string output, :int output");
		test_value($x, params, "get_values");
	}

	# we use Datasource::selectRows() in the following queries because we
	# get hash results instead of a hash of lists as with exec in the queries
	# normally we should not use selectRows to execute a stored procedure,
	# as the Datasource::selectRows() method will not grab the transaction lock,
	# but we already called Datasource::exec() above, so we have it already.
	# the other alternative would be to call Datasource::beginTransaction() before
	# Datasource::selectRows()

	# simple stored proc test, bind by name, returns hash
	$x = $db.selectRows("exec find_family %v", "Smith");
	test_value($x, family_q, "simple stored proc");

	# stored proc execute with output params and select results
	if ($db.is_sybase)
	{
		$x = $db.selectRows("declare @string varchar(40), @int int
		exec get_values_and_select :string output, :int output");
		test_value($x, ("query":family_q,"params":params), "get_values_and_select");

		# stored proc execute with output params and multiple select results
		$x = $db.selectRows("declare @string varchar(40), @int int
		exec get_values_and_multiple_select :string output, :int output");
		test_value($x, ("query":("query0":family_q,"query1":person_q),"params":params), "get_values_and_multiple_select");
	}

	# stored proc execute with just select results
	$x = $db.selectRows("exec just_select");
	test_value($x, family_q, "just_select");

	# stored proc execute with multiple select results
	$x = $db.selectRows("exec multiple_select");
	test_value($x, ("query0":family_q,"query1":person_q), "multiple_select");

	# the freetds driver does not work with the following sybase column types:
	# unichar, univarchar

	my $args = ( "null_f"          : NULL,
		 "varchar_f"       : "test",
		 "char_f"          : "test",
		 "text_f"          : "test",
		 "unitext_f"       : "test",
		 "bit_f"           : True,
		 "tinyint_f"       : 55,
		 "smallint_f"      : 4285,
		 "int_f"           : 405402,
		 "int_f2"          : 214123498,
		 "decimal_f"       : 500.1231,
		 "float_f"         : 23443.234324234,
		 "real_f"          : 213.123,
		 "money_f"         : 3434234250.2034,
		 "smallmoney_f"    : 211100.1012,
		 "date_f"          : 2007-05-01,
			 "time_f"          : 10:30:01,
		 "datetime_f"      : 3459-01-01T11:15:02.250,
		 "smalldatetime_f" : 2007-12-01T12:01:00,
		 "binary_f"        : <0badbeef>,
		 "varbinary_f"     : <feedface>,
		 "image_f"         : <cafebead> );

	# remove fields not supported by sql server
	if (!$db.is_sybase)
	{
		delete $args.unitext_f;
		delete $args.date_f;
		delete $args.time_f;
	}

	my $sql = "insert into data_test values (";
	for (my $i; $i < elements $args; ++$i)
	$sql += "%v, ";
	$sql = substr($sql, 0, -2) + ")";

	# insert data, using the values from the hash above
	my $rows = $db.vexec($sql, hash_values($args));

	my $q = $db.selectRow("select * from data_test");
	if ($o.verbose > 1)
		foreach my $k in (keys $q)
			tprintf(2, " %-16s= %-10s %N\\n", $k, type($q.$k), $q.$k);

	# remove values where we know they won't match
	# unitext_f is returned as IMAGE by the server
	delete $q.unitext_f;
	delete $args.unitext_f;
	# rounding errors can happen in real
	$q.real_f = round($q.real_f);
	$args.real_f = round($args.real_f);

	# compare each value
	foreach my $k in (keys $q)
		test_value($q.$k, $args.$k, sprintf("%s bind and retrieve", $k));

	$db.commit();
}

sub main()
{
	my $test_map =
	( "sybase" : \\sybase_test(),
		"freetds"  : \\freetds_test(),
		"mysql"  : \\mysql_test(),
		"pgsql"  : \\pgsql_test(),
		"oracle" : \\oracle_test());

	parse_command_line();
	my $db = getDS();

	my $driver = $db.getDriverName();
	printf("testing %s driver\\n", $driver);
	my $sv = $db.getServerVersion();
	if ($o.verbose > 1)
		tprintf(2, "client version=%n\\nserver version=%n\\n", $db.getClientVersion(), $sv);

	# determine if the server is a sybase or sql server dataserver
	if ($driver == "freetds")
	if ($sv !~ /microsoft/i)
		$db.is_sybase = True;

	create_datamodel($db);

	context_test($db);
	transaction_test($db);
	my $test = $test_map.($db.getDriverName());
	if (exists $test)
		$test($db);

	if (!$o.leave)
		drop_test_datamodel($db);
	printf("%d/%d tests OK\\n", $test_count - $errors, $test_count);
}

main();
`,
	robotframework: `# Full example
*** Settings ***
Documentation    Example using the space separated plain text format.
Library          OperatingSystem

*** Variables ***
\${MESSAGE}       Hello, world!

*** Test Cases ***
My Test
	[Documentation]    Example test
	Log    \${MESSAGE}
	My Keyword    /tmp

Another Test
	Should Be Equal    \${MESSAGE}    Hello, world!

*** Keywords ***
My Keyword
	[Arguments]    \${path}
	Directory Should Exist    \${path}
`,
	ruby: `# Comments
# This is a comment
=begin
Multi-line
comment
=end

# Strings
"foo \\"bar\\" baz"
'foo \\'bar\\' baz'
<<STRING
	here's some #{string} contents
STRING

# Regular expressions
/foo?[ ]*bar/

# Variables
$foo = 5;
class InstTest
	def set_foo(n)
		@foo = n
	end
	def set_bar(n)
		@bar = n
	end
end

# Symbols
mystring = :steveT;

# String Interpolation
"foo #{'bar'+my_variable}"
`,
	rust: `// Comments
// Single line comment
/// Doc comments
/* Multiline
comment */

// Strings
'C'; '\\''; '\\n'; '\\u{7FFF}'; // Characters
"foo \\"bar\\" baz"; // String
r##"foo #"bar"# baz"##; // Raw string with # pairs
b'C'; b'\\''; b'\\n'; // Bytes
b"foo \\"bar\\" baz"; // Byte string
br##"foo #"bar"# baz"##; // Raw byte string with # pairs

// Numbers
0xff_u8;                           // type u8
0o70_i16;                          // type i16
0b1111_1111_1001_0000_i32;         // type i32

123.0f64;        // type f64
0.1f64;          // type f64
0.1f32;          // type f32
12E+99_f64;      // type f64

// Booleans
true; false;

// Functions and macros
println!("x is {}", x);
fn next_two(x: i32) -> (i32, i32) { (x + 1, x + 2) }
next_two(5);
vec![1, 2, 3];

// Attributes
#![warn(unstable)]
#[test]
fn a_test() {
	// ...
}

// Closure parameters and bitwise OR
let x = a | b;
let y = c || d;
let add_one = |x: i32| -> i32 { 1i + x };
let printer = || { println!("x is: {}", x); };
`,
	sass: `// Comments
/* This comment will appear in the CSS output.
	This is nested beneath the comment,
	so it's part of it

// This comment will not appear in the CSS output.
	This is nested beneath the comment as well,
	so it also won't appear

// At-rules and shortcuts
@mixin large-text
	color: #ff0000

@media (min-width: 600px)
	h1
		@include large-text

=large-text
	color: #ff0000

h1
	+large-text

// Variables
$width: 5em
#main
	width: $width
`,
	sas: `/* Comments */
/* This is a
multi-line comment */

* This is a comment too;

/* Numbers, dates and times */
42; 4.5; 4.5e-10; -3; -3.5e2; -4.2e-23;
0afx; 0123x;
'1jan2013'd; '01jan09'd;
'9:25't; '9:25:19pm't;
'01may12:9:30:00'dt; '18jan2003:9:27:05am'dt;
'2013-05-17T09:15:30–05:00'dt; '2013-05-17T09:15:30–05'dt;
'2013-07-20T12:00:00+00:00'dt; '2013-07-20T12:00:00Z'dt;

/* Strings */
'Single quoted string';
"Double quoted string";
'String ''quoted'' string "containing" quote';
"Double ""quoted"" string 'containing' quote";

/* Operators */
A**B;
'foo'||'bar'!!'baz'¦¦'test';
A<>B><C;
A~=B¬=C^=D>=E<=F;
a*b/c+d-e<f>g&h|i!j¦k;
~a;¬b;^c;
(a eq b) ne (c gt d) lt e ge f le h;
state in ('NY','NJ','PA');
not a;

/* More examples */
/* Some examples adapted from the documentation
   http://support.sas.com/documentation/cdl/en/basess/64003/PDF/default/basess.pdf */

data city; * another inline comment;

	input Year 4. @7 ServicesPolice comma6.
		@15 ServicesFire comma6. @22 ServicesWater_Sewer comma6.
		@30 AdminLabor comma6. @39 AdminSupplies comma6.
		@45 AdminUtilities comma6.;
	ServicesTotal=ServicesPolice+ServicesFire+ServicesWater_Sewer;
	AdminTotal=AdminLabor+AdminSupplies+AdminUtilities;
	Total=ServicesTotal+AdminTotal;

	Test='A string '' whith a quote';
	Test2 = "A string "" whith a quote";

	label   Total='Total Outlays'
			ServicesTotal='Services: Total'
			ServicesPolice='Services: Police'
			ServicesFire='Services: Fire'
			ServicesWater_Sewer='Services: Water & Sewer'
			AdminTotal='Administration: Total'
			AdminLabor='Administration: Labor'
			AdminSupplies='Administration: Supplies'
			AdminUtilities='Administration: Utilities';
	datalines;
1993 2,819 1,120 422 391 63 98
1994 2,477 1,160 500 172 47 70
1995 2,028 1,061 510 269 29 79
1996 2,754 893 540 227 21 67
1997 2,195 963 541 214 21 59
1998 1,877 926 535 198 16 80
1999 1,727 1,111 535 213 27 70
2000 1,532 1,220 519 195 11 69
2001 1,448 1,156 577 225 12 58
2002 1,500 1,076 606 235 19 62
2003 1,934 969 646 266 11 63
2004 2,195 1,002 643 256 24 55
2005 2,204 964 692 256 28 70
2006 2,175 1,144 735 241 19 83
2007 2,556 1,341 813 238 25 97
2008 2,026 1,380 868 226 24 97
2009 2,526 1,454 946 317 13 89
2010 2,027 1,486 1,043 226 . 82
2011 2,037 1,667 1,152 244 20 88
2012 2,852 1,834 1,318 270 23 74
2013 2,787 1,701 1,317 307 26 66
;
proc datasets library=work nolist
;
contents data=city
;
run;


data city3;
	set city(firstobs=10 obs=15);
run;

data services (keep=ServicesTotal ServicesPolice ServicesFire
				ServicesWater_Sewer)
	admin (keep=AdminTotal AdminLabor AdminSupplies
			AdminUtilities);
	set city(drop=Total);
run;
proc print data=services;
	title 'City Expenditures: Services';
run;

data newlength;
	set mylib.internationaltours;
	length Remarks $ 30;
	if Vendor = 'Hispania' then Remarks = 'Bonus for 10+ people';
	else if Vendor = 'Mundial' then Remarks = 'Bonus points';
	else if Vendor = 'Major' then Remarks = 'Discount for 30+ people';
run;
proc print data=newlength;
	var Country Vendor Remarks;
	title 'Information About Vendors';
run;

libname mylib 'permanent-data-library';
data mylib.departures;
	input Country $ 1-9 CitiesInTour 11-12 USGate $ 14-26
	ArrivalDepartureGates $ 28-48;
	datalines;
Japan 5 San Francisco Tokyo, Osaka
Italy 8 New York Rome, Naples
Australia 12 Honolulu Sydney, Brisbane
Venezuela 4 Miami Caracas, Maracaibo
Brazil 4 Rio de Janeiro, Belem
;
proc print data=mylib.departures;
	title 'Data Set AIR.DEPARTURES';
run;

data missingval;
	length Country $ 10 TourGuide $ 10;
	input Country TourGuide;
	* lines is an alias for datalines;
	lines;
Japan Yamada
Italy Militello
Australia Edney
Venezuela .
Brazil Cardoso
;

data inventory_tool;
	input PartNumber $ Description $ InStock @17
		ReceivedDate date9. @27 Price;
	format ReceivedDate date9.;
	* cards is an alias for datalines;
	cards;
K89R seal 34 27jul2010 245.00
M4J7 sander 98 20jun2011 45.88
LK43 filter 121 19may2011 10.99
MN21 brace 43 10aug2012 27.87
BC85 clamp 80 16aug2012 9.55
NCF3 valve 198 20mar2012 24.50
KJ66 cutter 6 18jun2010 19.77
UYN7 rod 211 09sep2010 11.55
JD03 switch 383 09jan2013 13.99
BV1E timer 26 03aug2013 34.50
;
run;
`,
	scala: `// Comments
// Single line comment
/* Mutli-line
comment */

// Strings and characters
'a'
"foo bar baz"
"""Multi-line
string"""

// Numbers
0
21
0xFFFFFFFF
-42L
0.0
1e30f
3.14159f
1.0e-100
.1

// Symbols
'x
'identifier

// Full example
// Contributed by John Williams
package examples

object lazyLib {

	/** Delay the evaluation of an expression until it is needed. */
	def delay[A](value: => A): Susp[A] = new SuspImpl[A](value)

	/** Get the value of a delayed expression. */
	implicit def force[A](s: Susp[A]): A = s()

	/**
	 * Data type of suspended computations. (The name froms from ML.)
	 */
	abstract class Susp[+A] extends Function0[A]

	/**
	 * Implementation of suspended computations, separated from the
	 * abstract class so that the type parameter can be invariant.
	 */
	class SuspImpl[A](lazyValue: => A) extends Susp[A] {
		private var maybeValue: Option[A] = None

		override def apply() = maybeValue match {
			case None =>
				val value = lazyValue
				maybeValue = Some(value)
				value
			case Some(value) =>
				value
		}

		override def toString() = maybeValue match {
			case None => "Susp(?)"
			case Some(value) => "Susp(" + value + ")"
		}
	}
}

object lazyEvaluation {
	import lazyLib._

	def main(args: Array[String]) = {
		val s: Susp[Int] = delay { println("evaluating..."); 3 }

		println("s     = " + s)       // show that s is unevaluated
		println("s()   = " + s())     // evaluate s
		println("s     = " + s)       // show that the value is saved
		println("2 + s = " + (2 + s)) // implicit call to force()

		val sl = delay { Some(3) }
		val sl1: Susp[Some[Int]] = sl
		val sl2: Susp[Option[Int]] = sl1   // the type is covariant

		println("sl2   = " + sl2)
		println("sl2() = " + sl2())
		println("sl2   = " + sl2)
	}
}
`,
	scheme: `; Comments
; This is a comment

; Booleans
#t
#f

; Strings
"two \\"quotes\\" within"

; Functions
(lambda (x) (+ x 3))
(apply vector 'a 'b '(c d e))

; Full example
;; Calculation of Hofstadter's male and female sequences as a list of pairs

(define (hofstadter-male-female n)
  (letrec ((female (lambda (n)
		     (if (= n 0)
			 1
			 (- n (male (female (- n 1)))))))
	   (male (lambda (n)
		   (if (= n 0)
		       0
		       (- n (female (male (- n 1))))))))
    (let loop ((i 0))
      (if (> i n)
	  '()
	  (cons (cons (female i)
		      (male i))
		(loop (+ i 1)))))))

(hofstadter-male-female 8)
`,
	scss: `// Comments
// Single line comment
/* Multi-line
comment */

// At-rules
@import "foo.scss";
@media (min-width: 600px) {}
.seriousError {
	@extend .error;
}
@for $i from 1 through 3 {}

// Compass URLs
@font-face {
	font-family: "opensans";
	src: font-url("opensans.ttf");
}

// Variables
$width: 5em;
#main {
	width: $width;
}

// Interpolations are highlighted in property names
p.#{$name} {
	#{$attr}-color: blue;
}
`,
	smali: `# Full example
# Source: https://github.com/JesusFreke/smali/blob/master/examples/HelloWorld/HelloWorld.smali

.class public LHelloWorld;

#Ye olde hello world application
#To assemble and run this on a phone or emulator:
#
#java -jar smali.jar -o classes.dex HelloWorld.smali
#zip HelloWorld.zip classes.dex
#adb push HelloWorld.zip /data/local
#adb shell dalvikvm -cp /data/local/HelloWorld.zip HelloWorld
#
#if you get out of memory type errors when running smali.jar, try
#java -Xmx512m -jar smali.jar HelloWorld.smali
#instead

.super Ljava/lang/Object;

.method public static main([Ljava/lang/String;)V
	.registers 2

	sget-object v0, Ljava/lang/System;->out:Ljava/io/PrintStream;

	const-string v1, "Hello World!"

	invoke-virtual {v0, v1}, Ljava/io/PrintStream;->println(Ljava/lang/String;)V

	return-void
.end method
`,
	"shell-session": `Full example
$ git checkout master
Switched to branch 'master'
Your branch is up-to-date with 'origin/master'.
$ git push
Everything up-to-date
$ echo "Foo
> Bar"
Foo
Bar

foo@bar:/$ cd ~
foo@bar:~$ sudo -i
[sudo] password for foo:
root@bar:~# echo "hello!"
hello!
`,
	smalltalk: `" Numbers "
3
30.45
-3
0.005
-14.0
13772
8r377
8r153
8r34.1
8r-37
16r106
16rFF
16rAC.DC
16r-1.C
1.586e5
1.586e-3
8r3e2
2r11e6

" Strings and characters "
$a
$M
$-
$$
$1
'hi'
'food'
'the Smalltalk-80 system'
'can''t'

" Symbols "
#bill
#M63
#+
#*

" Arrays "
#(1 2 3)
#('food' 'utilities' 'rent' 'household' 'transportation' 'taxes' 'recreation')
#(('one' 1) ('not' 'negative') 0 -1)
#(9 'nine' $9 (0 'zero' $0 ( ) 'e' $f 'g' $h 'i'))

" Blocks "
sum := 0.
#(2 3 5 7 11) do: [ :primel | sum := sum + (prime * prime)]

sizeAdder := [ :array | total := total + array size].

[ :x :y | (x * x) + (y * y)]
[ :frame :clippingBox | frame intersect: clippingBox]

" Full example "
Object>>method: num
	"comment 123"
	| var1 var2 |
	(1 to: num) do: [:i | |var| ^i].
	Klass with: var1.
	Klass new.
	arr := #('123' 123.345 #hello Transcript var $@).
	arr := #().
	var2 = arr at: 3.
	^ self abc

heapExample
	"HeapTest new heapExample"
	"Multiline
	decription"
	| n rnd array time sorted |
	n := 5000.
	"# of elements to sort"
	rnd := Random new.
	array := (1 to: n)
				collect: [:i | rnd next].
	"First, the heap version"
	time := Time
				millisecondsToRun: [sorted := Heap withAll: array.
	1
		to: n
		do: [:i |
			sorted removeFirst.
			sorted add: rnd next]].
	Transcript cr; show: 'Time for Heap: ' , time printString , ' msecs'.
	"The quicksort version"
	time := Time
				millisecondsToRun: [sorted := SortedCollection withAll: array.
	1
		to: n
		do: [:i |
			sorted removeFirst.
			sorted add: rnd next]].
	Transcript cr; show: 'Time for SortedCollection: ' , time printString , ' msecs'
`,
	smarty: `{* Comments *}
{* This is a comment with <p>some markup</p> in it *}
{* Multi-line
comment *}

{* Variables *}
{$foo}
{$foo.bar}
{$foo.$bar}
{$foo[$bar]}
{$foo->bar}
{$foo->bar()}
{#foo#}
{$smarty.config.foo}
{$foo[bar]}

{* Strings and numbers *}
{$foo[4]}
{$foo['bar']}

{* Tags and filters *}
{assign var=foo value='baa'}
{include file='header.tpl'}
{$smarty.now|date_format:'%Y-%m-%d %H:%M:%S'}
{$title|truncate:40:'...'}
{$myArray|@count}

{math equation="height * width / division"
	height=$row_height
	width=$row_width
	division=#col_div#}

{* Control flow *}
{if ( $amount < 0 or $amount > 1000 ) and $volume >= #minVolAmt#}
	...
{/if}
{if count($var) gt 0}{/if}
{if $var is even by 3}
	...
{/if}

{foreach from=$myArray item=i name=foo}
	{$smarty.foreach.foo.index}|{$smarty.foreach.foo.iteration},
{/foreach}

<ul>
{foreach from=$items key=myId item=i}
  <li><a href="item.php?id={$myId}">{$i.no}: {$i.label}</li>
{/foreach}
</ul>

{* Literal section *}
{literal}
	<script>
		(function() { /* This is JS, not Smarty */ } ());
	</script>
{/literal}

<style type="text/css">
{literal}
/* this is an intersting idea for this section */
.madIdea{
	border: 3px outset #ffffff;
	margin: 2 3 4 5px;
	background-color: #001122;
}
{/literal}
</style>
`,
	sml: `(* Full example *)
(* source: https://github.com/HarrisonGrodin/ml-numbers/blob/ba35c763092052e391871edf224f17474c6231b1/src/Rational.sml *)

structure Rational :> RATIONAL =
	struct
		type t = int * int  (* (a,b) invariant: a,b coprime; b nonnegative *)

		local
			val rec gcd = fn
				(m,0) => m
			| (m,n) => gcd (n, m mod n)
		in
			infix 8 //
			val op // = fn (x,y) => (
				let
					val gcd = gcd (x,y)
				in
					(x div gcd, y div gcd)
				end
			)
		end

		val show = Fn.id

		val zero = (0,1)
		val one  = (1,1)

		val eq : t * t -> bool = (op =)
		val compare = fn ((a,b),(x,y)) => Int.compare (a * y, b * x)
		val toString = fn (x,y) => Int.toString x ^ " // " ^ Int.toString y
		val percent =
			Fn.curry (Fn.flip (op ^)) "%"
			o Int.toString
			o (fn (a,b) => (100 * a) div b)

		val op + = fn ((a,b),(x,y)) => (a * y + b * x) // (b * y)
		val ~ = fn (a,b) => (~a,b)
		val op - = fn (r1,r2) => r1 + ~r2

		val op * = fn ((a,b),(x,y)) => (a * x) // (b * y)
		val inv = Fn.flip (op //)
		val op / = fn (r1,r2) => r1 * inv r2
	end
`,
	solidity: `// Full example
pragma solidity >=0.4.22 <0.7.0;

/// @title Voting with delegation.
contract Ballot {
	// This declares a new complex type which will
	// be used for variables later.
	// It will represent a single voter.
	struct Voter {
		uint weight; // weight is accumulated by delegation
		bool voted;  // if true, that person already voted
		address delegate; // person delegated to
		uint vote;   // index of the voted proposal
	}

	// This is a type for a single proposal.
	struct Proposal {
		bytes32 name;   // short name (up to 32 bytes)
		uint voteCount; // number of accumulated votes
	}

	address public chairperson;

	// This declares a state variable that
	// stores a \`Voter\` struct for each possible address.
	mapping(address => Voter) public voters;

	// A dynamically-sized array of \`Proposal\` structs.
	Proposal[] public proposals;

	/// Create a new ballot to choose one of \`proposalNames\`.
	constructor(bytes32[] memory proposalNames) public {
		chairperson = msg.sender;
		voters[chairperson].weight = 1;

		// For each of the provided proposal names,
		// create a new proposal object and add it
		// to the end of the array.
		for (uint i = 0; i < proposalNames.length; i++) {
			// \`Proposal({...})\` creates a temporary
			// Proposal object and \`proposals.push(...)\`
			// appends it to the end of \`proposals\`.
			proposals.push(Proposal({
					name: proposalNames[i],
					voteCount: 0
			}));
		}
	}

	// Give \`voter\` the right to vote on this ballot.
	// May only be called by \`chairperson\`.
	function giveRightToVote(address voter) public {
		// If the first argument of \`require\` evaluates
		// to \`false\`, execution terminates and all
		// changes to the state and to Ether balances
		// are reverted.
		// This used to consume all gas in old EVM versions, but
		// not anymore.
		// It is often a good idea to use \`require\` to check if
		// functions are called correctly.
		// As a second argument, you can also provide an
		// explanation about what went wrong.
		require(
			msg.sender == chairperson,
			"Only chairperson can give right to vote."
		);
		require(
			!voters[voter].voted,
			"The voter already voted."
		);
		require(voters[voter].weight == 0);
		voters[voter].weight = 1;
	}

	/// Delegate your vote to the voter \`to\`.
	function delegate(address to) public {
		// assigns reference
		Voter storage sender = voters[msg.sender];
		require(!sender.voted, "You already voted.");

		require(to != msg.sender, "Self-delegation is disallowed.");

		// Forward the delegation as long as
		// \`to\` also delegated.
		// In general, such loops are very dangerous,
		// because if they run too long, they might
		// need more gas than is available in a block.
		// In this case, the delegation will not be executed,
		// but in other situations, such loops might
		// cause a contract to get "stuck" completely.
		while (voters[to].delegate != address(0)) {
			to = voters[to].delegate;

			// We found a loop in the delegation, not allowed.
			require(to != msg.sender, "Found loop in delegation.");
		}

		// Since \`sender\` is a reference, this
		// modifies \`voters[msg.sender].voted\`
		sender.voted = true;
		sender.delegate = to;
		Voter storage delegate_ = voters[to];
		if (delegate_.voted) {
			// If the delegate already voted,
			// directly add to the number of votes
			proposals[delegate_.vote].voteCount += sender.weight;
		} else {
			// If the delegate did not vote yet,
			// add to her weight.
			delegate_.weight += sender.weight;
		}
	}

	/// Give your vote (including votes delegated to you)
	/// to proposal \`proposals[proposal].name\`.
	function vote(uint proposal) public {
		Voter storage sender = voters[msg.sender];
		require(sender.weight != 0, "Has no right to vote");
		require(!sender.voted, "Already voted.");
		sender.voted = true;
		sender.vote = proposal;

		// If \`proposal\` is out of the range of the array,
		// this will throw automatically and revert all
		// changes.
		proposals[proposal].voteCount += sender.weight;
	}

	/// @dev Computes the winning proposal taking all
	/// previous votes into account.
	function winningProposal() public view
			returns (uint winningProposal_)
	{
		uint winningVoteCount = 0;
		for (uint p = 0; p < proposals.length; p++) {
			if (proposals[p].voteCount > winningVoteCount) {
				winningVoteCount = proposals[p].voteCount;
				winningProposal_ = p;
			}
		}
	}

	// Calls winningProposal() function to get the index
	// of the winner contained in the proposals array and then
	// returns the name of the winner
	function winnerName() public view
			returns (bytes32 winnerName_)
	{
		winnerName_ = proposals[winningProposal()].name;
	}
}
`,
	"solution-file": `# Full example
# https://docs.microsoft.com/en-us/visualstudio/extensibility/internals/solution-dot-sln-file?view=vs-2015&redirectedfrom=MSDN
Microsoft Visual Studio Solution File, Format Version 12.00
# Visual Studio Version 16
VisualStudioVersion = 16.0.29709.97
MinimumVisualStudioVersion = 10.0.40219.1
Project("{F184B08F-C81C-45F6-A57F-5ABD9991F28F}") = "Project1", "Project1.vbproj", "{8CDD8387-B905-44A8-B5D5-07BB50E05BEA}"
EndProject
Global
	GlobalSection(SolutionNotes) = postSolution
	EndGlobalSection
	GlobalSection(SolutionConfiguration) = preSolution
		ConfigName.0 = Debug
		ConfigName.1 = Release
	EndGlobalSection
	GlobalSection(ProjectDependencies) = postSolution
	EndGlobalSection
	GlobalSection(ProjectConfiguration) = postSolution
		{8CDD8387-B905-44A8-B5D5-07BB50E05BEA}.Debug.ActiveCfg = Debug|x86
		{8CDD8387-B905-44A8-B5D5-07BB50E05BEA}.Debug.Build.0 = Debug|x86
		{8CDD8387-B905-44A8-B5D5-07BB50E05BEA}.Release.ActiveCfg = Release|x86
		{8CDD8387-B905-44A8-B5D5-07BB50E05BEA}.Release.Build.0 = Release|x86
	EndGlobalSection
	GlobalSection(ExtensibilityGlobals) = postSolution
	EndGlobalSection
	GlobalSection(ExtensibilityAddIns) = postSolution
	EndGlobalSection
EndGlobal
`,
	soy: `// Comments
/* Multi-line
comment */
// This is a comment with <p>some markup</p> in it

// Variable
{$name}
{$folders[0]['name']}
{$aaa?.bbb.ccc?[0]}

// Commands
{template .helloNames}
	// Greet the person.
	{call .helloName data="all" /}<br>
	// Greet the additional people.
	{foreach $additionalName in $additionalNames}
		{call .helloName}
			{param name: $additionalName /}
		{/call}
		{if not isLast($additionalName)}
			<br>  // break after every line except the last
		{/if}
	{ifempty}
		No additional people to greet.
	{/foreach}
{/template}

// Functions and print directives
{if length($items) > 5}
{$foo|changeNewlineToBr}
{$bar|truncate: 4, false}

// Literal section
{literal}
This is not a {$variable}
{/literal}
`,
	sparql: `# query 2.1.6 Examples of Query Syntax
PREFIX  dc: <http://purl.org/dc/elements/1.1/>
	SELECT  ?title
	WHERE   { <http://example.org/book/book1> dc:title ?title }

# query 2.1.6-q1 Examples of Query Syntax
PREFIX  dc: <http://purl.org/dc/elements/1.1/>
PREFIX  : <http://example.org/book/>
SELECT  $title
WHERE   { :book1  dc:title  $title }

# query 2.1.6-q2 Examples of Query Syntax
BASE    <http://example.org/book/>
PREFIX  dc: <http://purl.org/dc/elements/1.1/>
SELECT  $title
WHERE   { <book1>  dc:title  ?title }

# query 2.5.3 Example of Basic Graph Pattern Matching
PREFIX foaf:   <http://xmlns.com/foaf/0.1/>
SELECT ?mbox
WHERE
	{ ?x foaf:name "Johnny Lee Outlaw" .
		?x foaf:mbox ?mbox }

# query 3.1.1 Matching Integers
SELECT ?v WHERE { ?v ?p 42 }

# query 3.1.2 Matching Arbitrary Datatypes
SELECT ?v WHERE { ?v ?p "abc"^^<http://example.org/datatype#specialDatatype> }

# query 3.1.3-q1 Matching Language Tags
SELECT ?x WHERE { ?x ?p "cat"@en }

# query 3.2 Value Constraints
PREFIX  dc:  <http://purl.org/dc/elements/1.1/>
PREFIX  ns:  <http://example.org/ns#>
SELECT  ?title ?price
WHERE   { ?x ns:price ?price .
					FILTER (?price < 30) .
					?x dc:title ?title . }

# query 5.5 Nested Optional Graph Patterns
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX vcard: <http://www.w3.org/2001/vcard-rdf/3.0#>
SELECT ?foafName ?mbox ?gname ?fname
WHERE
	{  ?x foaf:name ?foafName .
		 OPTIONAL { ?x foaf:mbox ?mbox } .
		 OPTIONAL { ?x vcard:N ?vc .
								?vc vcard:Given ?gname .
								OPTIONAL { ?vc vcard:Family ?fname }
							}
	}

# query 6.1-q2 Joining Patterns with UNION
PREFIX dc10:  <http://purl.org/dc/elements/1.1/>
PREFIX dc11:  <http://purl.org/dc/elements/1.0/>

SELECT ?title ?author
WHERE { { ?book dc10:title ?title .  ?book dc10:creator ?author }
				UNION
				{ ?book dc11:title ?title .  ?book dc11:creator ?author }
			}

# query 8.3 Restricting by Bound Variables
PREFIX  data:  <http://example.org/foaf/>
PREFIX  foaf:  <http://xmlns.com/foaf/0.1/>
PREFIX  rdfs:  <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?mbox ?nick ?ppd
WHERE
{
	GRAPH data:aliceFoaf
	{
		?alice foaf:mbox <mailto:alice@work.example> ;
					 foaf:knows ?whom .
		?whom  foaf:mbox ?mbox ;
					 rdfs:seeAlso ?ppd .
		?ppd  a foaf:PersonalProfileDocument .
	} .
	GRAPH ?ppd
	{
		?w foaf:mbox ?mbox ;
			 foaf:nick ?nick
	}
}

# query 9.3 Combining FROM and FROM NAMED
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>

SELECT ?who ?g ?mbox
FROM <http://example.org/dft.ttl>
FROM NAMED <http://example.org/alice>
FROM NAMED <http://example.org/bob>
WHERE
{
	?g dc:publisher ?who .
	GRAPH ?g { ?x foaf:mbox ?mbox }
}

# query 10.1.2 DISTINCT
PREFIX foaf:    <http://xmlns.com/foaf/0.1//>
SELECT DISTINCT ?name WHERE { ?x foaf:name ?name }

# query 10.1.3-q2 ORDER BY
PREFIX foaf:    <http://xmlns.com/foaf/0.1/>

SELECT ?name
WHERE { ?x foaf:name ?name ; :empId ?emp }
ORDER BY ?name DESC(?emp)

# query 10.1.5 OFFSET
PREFIX foaf:    <http://xmlns.com/foaf/0.1/>

SELECT  ?name
WHERE   { ?x foaf:name ?name }
ORDER BY ?name
LIMIT   5
OFFSET  10

# query 10.3.1 Templates with Blank Nodes
PREFIX foaf:    <http://xmlns.com/foaf/0.1/>
PREFIX vcard:   <http://www.w3.org/2001/vcard-rdf/3.0#>

CONSTRUCT { ?x  vcard:N _:v .
						_:v vcard:givenName ?gname .
						_:v vcard:familyName ?fname }
WHERE
{
	{ ?x foaf:firstname ?gname } UNION  { ?x foaf:givenname   ?gname } .
	{ ?x foaf:surname   ?fname } UNION  { ?x foaf:family_name ?fname } .
}

# query 10.3.3 Solution Modifiers and CONSTRUCT
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX site: <http://example.org/stats#>

CONSTRUCT { [] foaf:name ?name }
WHERE
{ [] foaf:name ?name ;
		 site:hits ?hits .
}
ORDER BY desc(?hits)
LIMIT 2

# query 10.4.3 Descriptions of Resources
PREFIX ent:  <http://org.example.com/employees#>
DESCRIBE ?x WHERE { ?x ent:employeeId "1234" }

# query 10.5-q1 Asking "yes or no" questions
PREFIX foaf:    <http://xmlns.com/foaf/0.1/>
ASK  { ?x foaf:name  "Alice" ;
					foaf:mbox  <mailto:alice@work.example> }

# query 11.4.1 bound
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX dc:   <http://purl.org/dc/elements/1.1/>
PREFIX xsd:   <http://www.w3.org/2001/XMLSchema#>
SELECT ?name
WHERE { ?x foaf:givenName  ?givenName .
				OPTIONAL { ?x dc:date ?date } .
				FILTER ( bound(?date) ) }

# query 11.4.3 isBlank
PREFIX a:      <http://www.w3.org/2000/10/annotation-ns#>
PREFIX dc:     <http://purl.org/dc/elements/1.1/>
PREFIX foaf:   <http://xmlns.com/foaf/0.1/>

SELECT ?given ?family
WHERE { ?annot  a:annotates  <http://www.w3.org/TR/rdf-sparql-query/> .
	?annot  dc:creator   ?c .
	OPTIONAL { ?c  foaf:given   ?given ; foaf:family  ?family } .
	FILTER isBlank(?c)
}

# query 11.4.5 str
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT ?name ?mbox
WHERE { ?x foaf:name  ?name ;
					 foaf:mbox  ?mbox .
FILTER regex(str(?mbox), "@work.example") }

# query 11.4.7 datatype
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>
PREFIX eg:   <http://biometrics.example/ns#>
SELECT ?name ?shoeSize
WHERE { ?x foaf:name  ?name ; eg:shoeSize  ?shoeSize .
				FILTER ( datatype(?shoeSize) = xsd:integer ) }

# query 11.4.10-q1 RDFterm-equal
PREFIX a:      <http://www.w3.org/2000/10/annotation-ns#>
PREFIX dc:     <http://purl.org/dc/elements/1.1/>
PREFIX xsd:    <http://www.w3.org/2001/XMLSchema#>

SELECT ?annotates
WHERE { ?annot  a:annotates  ?annotates .
				?annot  dc:date      ?date .
				FILTER ( ?date = xsd:dateTime("2004-01-01T00:00:00Z") || ?date = xsd:dateTime("2005-01-01T00:00:00Z") ) }

# query 11.6-q1 Extensible Value Testing
PREFIX aGeo: <http://example.org/geo#>

SELECT ?neighbor
WHERE { ?a aGeo:placeName "Grenoble" .
				?a aGeo:location ?axLoc .
				?a aGeo:location ?ayLoc .

				?b aGeo:placeName ?neighbor .
				?b aGeo:location ?bxLoc .
				?b aGeo:location ?byLoc .

				FILTER ( aGeo:distance(?axLoc, ?ayLoc, ?bxLoc, ?byLoc) < 10 ) .
			}

# Full Example query
base <http://example.org/geo#>
prefix geo: <http://www.opengis.net/ont/geosparql#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
select ?shape ?shapeColor ?shapeHeight ?shapeName (sample(?shapeLabel) as ?shapeLabel)  {
	{
		select * {
			values (?placeName ?streetName) {
				"Grenoble" "Paul Mistral"
			}
			?place geo:NamePlace ?placeName.
			?pand geo:hasGeometry/geo:asWKT ?shape;
		}
	}
	?pand geo:measuredHeight ?shapeHeight.
	# Only retrieve buildings larger then 10 meters.
	FILTER ( ?shapeHeight < 10 ) .
	BIND(IF(!bound(?EindGeldigheid5), "#22b14c", "#ed1c24" ) AS?tColor)
	# tekst label
	bind(concat(str(?streetName),' ',str(?houseNumber),', ',str(?PlaceName)) as ?shapeName)
	bind("""Multi-line
	String Element
	""" as ?shapeLabel)
}
group by ?shape ?shapeColor ?shapeHeight ?shapeName
limit 10
`,
	"splunk-spl": `\`comment(" Full example ")\`
source=monthly_data.csv
| rename remote_ip AS ip
| eval isLocal=if(cidrmatch("123.132.32.0/25",ip), "local", "not local")
| eval error=case(status == 200, "OK", status == 404, "Not found", true(), "Other")
	\`comment("TODO: Add support for more status codes")\`
| sort amount
`,
	sqf: `// Full example
#include "script_component.hpp"
/*
 * Author: BaerMitUmlaut
 * Handles any audible, visual and physical effects of fatigue.
 *
 * Arguments:
 * 0: Unit <OBJECT>
 * 1: Fatigue <NUMBER>
 * 2: Speed <NUMBER>
 * 3: Overexhausted <BOOL>
 *
 * Return Value:
 * None
 *
 * Example:
 * [_player, 0.5, 3.3, true] call ace_advanced_fatigue_fnc_handleEffects
 *
 * Public: No
 */
params ["_unit", "_fatigue", "_speed", "_overexhausted"];

#ifdef DEBUG_MODE_FULL
	systemChat str _fatigue;
	systemChat str vectorMagnitude velocity _unit;
#endif

// - Audible effects ----------------------------------------------------------
GVAR(lastBreath) = GVAR(lastBreath) + 1;
if (_fatigue > 0.4 && {GVAR(lastBreath) > (_fatigue * -10 + 9)} && {!underwater _unit}) then {
	switch (true) do {
		case (_fatigue < 0.6): {
			playSound (QGVAR(breathLow) + str(floor random 6));
		};
		case (_fatigue < 0.85): {
			playSound (QGVAR(breathMid) + str(floor random 6));
		};
		default {
			playSound (QGVAR(breathMax) + str(floor random 6));
		};
	};
	GVAR(lastBreath) = 0;
};

// - Visual effects -----------------------------------------------------------
GVAR(ppeBlackoutLast) = GVAR(ppeBlackoutLast) + 1;
if (GVAR(ppeBlackoutLast) == 1) then {
	GVAR(ppeBlackout) ppEffectAdjust [1,1,0,[0,0,0,1],[0,0,0,0],[1,1,1,1],[10,10,0,0,0,0.1,0.5]];
	GVAR(ppeBlackout) ppEffectCommit 1;
} else {
	if (_fatigue > 0.85) then {
		if (GVAR(ppeBlackoutLast) > (100 - _fatigue * 100) / 3) then {
			GVAR(ppeBlackout) ppEffectAdjust [1,1,0,[0,0,0,1],[0,0,0,0],[1,1,1,1],[2,2,0,0,0,0.1,0.5]];
			GVAR(ppeBlackout) ppEffectCommit 1;
			GVAR(ppeBlackoutLast) = 0;
		};
	};
};

// - Physical effects ---------------------------------------------------------
if (GVAR(isSwimming)) exitWith {
	if (GVAR(setAnimExclusions) isEqualTo []) then {
		_unit setAnimSpeedCoef linearConversion [0.7, 0.9, _fatigue, 1, 0.5, true];
	};
	if ((isSprintAllowed _unit) && {_fatigue > 0.7}) then {
		[_unit, "blockSprint", QUOTE(ADDON), true] call EFUNC(common,statusEffect_set);
	} else {
		if ((!isSprintAllowed _unit) && {_fatigue < 0.7}) then {
			[_unit, "blockSprint", QUOTE(ADDON), false] call EFUNC(common,statusEffect_set);
		};
	};
};
if ((getAnimSpeedCoef _unit) != 1) then {
	if (GVAR(setAnimExclusions) isEqualTo []) then {
		TRACE_1("reset",getAnimSpeedCoef _unit);
		_unit setAnimSpeedCoef 1;
	};
};

if (_overexhausted) then {
	[_unit, "forceWalk", QUOTE(ADDON), true] call EFUNC(common,statusEffect_set);
} else {
	if (isForcedWalk _unit && {_fatigue < 0.7}) then {
		[_unit, "forceWalk", QUOTE(ADDON), false] call EFUNC(common,statusEffect_set);
	} else {
		if ((isSprintAllowed _unit) && {_fatigue > 0.7}) then {
			[_unit, "blockSprint", QUOTE(ADDON), true] call EFUNC(common,statusEffect_set);
		} else {
			if ((!isSprintAllowed _unit) && {_fatigue < 0.6}) then {
				[_unit, "blockSprint", QUOTE(ADDON), false] call EFUNC(common,statusEffect_set);
			};
		};
	};
};

_unit setVariable [QGVAR(aimFatigue), _fatigue];

private _aimCoef = [missionNamespace, "ACE_setCustomAimCoef", "max"] call EFUNC(common,arithmeticGetResult);
_unit setCustomAimCoef _aimCoef;
`,
	sql: `-- Comments
# Single line comment
-- Single line comment
// Single line comment
/* Multi-line
comment */

-- Strings
"foo \\"bar\\" baz"
'foo \\'bar\\' baz'
"Multi-line strings
are supported"
'Multi-line strings
are supported'

-- Variables
SET @variable = 1;
SET @$_ = 2;
SET @"quoted-variable" = 3;
SET @'quoted-variable' = 3;
SET @\`quoted-variable\` = 3;

-- Operators
SELECT 1 && 1;
SELECT 1 OR NULL;
SELECT 5 & 2*3;
SELECT 2 BETWEEN 1 AND 3;

-- Functions and keywords
SELECT COUNT(*) AS cpt, MAX(t.pos) AS max_pos
FROM \`my_table\`
LEFT JOIN \`other_table\` AS t
WHERE \`somecol\` IS NOT NULL
ORDER BY t.other_col DESC
`,
	stan: `// Full example
// source: https://github.com/stan-dev/example-models/blob/8a6964135560f54f52695ccd4d2492a8067f0c30/misc/linear-regression/regression_std.stan

// normal mixture, unknown proportion and means, known variance
// p(y|mu,theta) = theta * Normal(y|mu[1],1) + (1-theta) * Normal(y|mu[2],1);

data {
	int<lower=0>  N;
	real y[N];
}
parameters {
	real<lower=0,upper=1> theta;
	real mu[2];
}
model {
	theta ~ uniform(0,1); // equivalently, ~ beta(1,1);
	for (k in 1:2)
		mu[k] ~ normal(0,10);
	for (n in 1:N)
		target += log_mix(theta, normal_lpdf(y[n]|mu[1],1.0), normal_lpdf(y[n]|mu[2],1.0));
}
`,
	squirrel: `// Full example
// source: http://www.squirrel-lang.org/#look

local table = {
	a = "10"
	subtable = {
		array = [1,2,3]
	},
	[10 + 123] = "expression index"
}

local array=[ 1, 2, 3, { a = 10, b = "string" } ];

foreach (i,val in array)
{
	::print("the type of val is"+typeof val);
}

/////////////////////////////////////////////

class Entity
{
	constructor(etype,entityname)
	{
		name = entityname;
		type = etype;
	}

	x = 0;
	y = 0;
	z = 0;
	name = null;
	type = null;
}

function Entity::MoveTo(newx,newy,newz)
{
	x = newx;
	y = newy;
	z = newz;
}

class Player extends Entity {
	constructor(entityname)
	{
		base.constructor("Player",entityname)
	}
	function DoDomething()
	{
		::print("something");
	}

}

local newplayer = Player("da playar");

newplayer.MoveTo(100,200,300);
`,
	stata: `// Full example
// Source: https://blog.stata.com/2018/10/09/how-to-automate-common-tasks/
program normalize
	version 15.1

	syntax varlist [if] [in] [ , prefix(name) suffix(name) ]

	foreach var in \`varlist' {
		summarize \`var' \`if' \`in'
		generate \`prefix'\`var'\`suffix' = (\`var' - r(mean)) / r(sd)   \`if' \`in'
	}
end
`,
	stylus: `// Full Example
/*!
 * Adds the given numbers together.
 */
/*
 * Adds the given numbers together.
 */
// I'm a comment!
body {
	font: 12px Helvetica, Arial, sans-serif;
}
a.button {
	-webkit-border-radius: 5px;
	-moz-border-radius: 5px;
	border-radius: 5px;
}

body
	font: 12px Helvetica, Arial, sans-serif;

a.button:after
	-webkit-border-radius: 5px;
	-moz-border-radius: 5px;
	border-radius: 5px;

body
	font: 12px Helvetica, Arial, sans-serif

a.link > button#test, input[type=button], a:after
	-webkit-border-radius: 5px
	-moz-border-radius: 5px
	border-radius: 5px

font-size = 14px
font = font-size "Lucida Grande", Arial

body {
	padding: 50px;
	font: 14px/1.4 fonts;
}

border-radius()
	-webkit-border-radius arguments
	-moz-border-radius arguments
	border-radius arguments

body
	font 12px Helvetica, Arial, sans-serif

a.button
	border-radius(5px)

@media (max-width: 30em) {
	body {
		color: #fff;
	}
}

@media (max-width: 500px)
	.foo
		color: #000

	@media (min-width: 100px), (min-height: 200px)
		.foo
			color: #100

sum(nums...)
	sum = 0
	sum += n for n in nums

sum(1 2 3 4)
// => 10
`,
	supercollider: `// Full Example
// Source: https://supercollider.github.io/
// modulate a sine frequency and a noise amplitude with another sine
// whose frequency depends on the horizontal mouse pointer position
{
	var x = SinOsc.ar(MouseX.kr(1, 100));
	SinOsc.ar(300 * x + 800, 0, 0.1)
	+
	PinkNoise.ar(0.1 * x + 0.1)
}.play;
`,
	svelte: `<!-- Component script -->
<script lang="ts">
	import MyComponent from "./MyComponent.svelte"
</script>

<!-- Markup -->
<div class="foo">
	<button disabled>can't touch this</button>
</div>

<!-- Unquoted attribute -->
<input type=checkbox />

<!-- JS Expressions inside attributes -->
<a href="page/{p}">page {p}</a>

<!-- JS expression as attribute value -->
<button disabled={!clickable}>...</button>

<!-- Attribute shorthand -->
<button {disabled}>...</button>

<!-- Attribute spread -->
<Widget {...things} />

<!-- Events -->
<button onclick={() => console.log('clicked')}>click me</button>

<!-- Bind attributes -->
<input bind:value={name} autofocus />

<!-- Snippet block -->
{#snippet todo(todo: Todo)}
	<li class="todo">
		<input class="toggle" type="checkbox" bind:checked={todo.completed}>
		{todo.title}
		<button class="remove" onclick={() => removeTodo(todo)}></button>
	</li>
{/snippet}

<!-- Each block -->
<ul>
	{#each todos as todo}
		{@render todo(todo)}
	{:else}
		<li>No todos</li>
	{/each}
</ul>

<!-- Normal style element -->
<style>
	div {
		color: red;
	}
</style>

<!-- Style element with SCSS -->
<style lang="scss">
	$primary-color: #333;
	body {
		color: $primary-color;
	}
</style>
`,
	swift: `// Comments
// this is a comment
/* this is also a comment,
but written over multiple lines */

// Numbers
42
-23
3.14159
0.1
-273.15
1.25e-2
0xC.3p0
1_000_000
1_000_000.000_000_1

// Strings
let someString = "Some string literal value"
var emptyString = ""
// String interpolation
let multiplier = 3
"\\(multiplier) times 2.5 is \\(Double(multiplier) * 2.5)"

// Control flow
for index in 1...5 {
	println("\\(index) times 5 is \\(index * 5)")
}
for _ in 1...power {
	answer *= base
}
while square < finalSquare {
	// roll the dice
	if ++diceRoll == 7 { diceRoll = 1 }
	// move by the rolled amount
	square += diceRoll
	if square < board.count {
		// if we're still on the board, move up or down for a snake or a ladder
		square += board[square]
	}
}
switch someCharacter {
	case "a", "e", "i", "o", "u":
		println("\\(someCharacter) is a vowel")
	case "b", "c", "d", "f", "g", "h", "j", "k", "l", "m",
		"n", "p", "q", "r", "s", "t", "v", "w", "x", "y", "z":
		println("\\(someCharacter) is a consonant")
	default:
		println("\\(someCharacter) is not a vowel or a consonant")
}

// Classes and attributes
class MyViewController: UIViewController {
	@IBOutlet weak var button: UIButton!
	@IBOutlet var textFields: [UITextField]!
	@IBAction func buttonTapped(AnyObject) {
		println("button tapped!")
	}
}

@IBDesignable
class MyCustomView: UIView {
	@IBInspectable var textColor: UIColor
	@IBInspectable var iconHeight: CGFloat
	/* ... */
}
`,
	systemd: `# Full example
# Source: https://www.freedesktop.org/software/systemd/man/systemd.syntax.html

[Section A]
KeyOne=value 1
KeyTwo=value 2

# a comment

[Section B]
Setting="something" "some thing" "…"
KeyTwo=value 2 \\
			 value 2 continued

[Section C]
KeyThree=value 3\\
# this line is ignored
; this line is ignored too
			 value 3 continued
`,
	"t4-cs": `Full example
<#@ template hostspecific="false" language="C#" #>
<#@ assembly name="System.Core.dll" #>
<#@ output extension=".txt" #>
<#
	using System.Collections.Generic;

	var numbers = new List<int> { 0, 1, 2, 3, 4, 5, 6, /* 7, */ 8, 9, 10  };

	foreach (var i in numbers)
	{
#>
The square of <#= i #> is <#= i * i #>
<#
	}
#>
`,
	"t4-vb": `Full example
<#@ template hostspecific="false" language="VB" #>
<#@ assembly name="System.Core.dll" #>
<#@ output extension=".txt" #>
<#
	Imports System.Collections.Generic

	Dim numbers() As Integer = { 0, 1, 2, 3, 4, 5, 6, 8, 9, 10  }
	' not including 7

	For Each i In numbers
#>
The square of <#= i #> is <#= i * i #>
<#
	Next
#>
`,
	tap: `Full example
1..48
ok 1 Description # Directive
# Diagnostic
....
ok 47 Description
ok 48 Description
`,
	tcl: `# Comments
# This is a comment

# Strings
"foo \\"bar\\" baz"
"foo\\
bar\\
baz"

# Variables
$foo
$foo::bar_42
$::baz
\${foobar}
set foo::bar "baz"

# Functions
proc foobar {baz} {
	puts $baz
}

proc RESTORE/post/:post_id/comment/:comment_id {post_id comment_id} {
	#| Restore a comment handler
	comment_restore $comment_id
	qc::actions redirect [url "/post/$post_id" show_deleted_comment_ids $comment_id]
}
`,
	textile: `<!-- HTML -->
I am <b>very</b> serious.

<div style="background:#fff">Foo bar</div>

<!-- Blocks -->
h1. Header 1

h2. Header 2

h3. Header 3 written on
multiple lines

bq. A block quotation
on multiple lines.

<!-- Footnotes -->
This is covered elsewhere[1].

fn1. Down here, in fact.

<!-- Structural emphasis -->
I _believe_ every word.
And then? She *fell*!

I __know__.
I **really** __know__.

??Cat's Cradle?? by Vonnegut

Convert with @r.to_html@

I'm -sure- not sure.

You are a +pleasant+ child.

a ^2^ + b ^2^ = c ^2^
log ~2~ x

<!-- Block attributes -->
p(example1). An example

p(#big-red). Red here

p(example1#big-red2). Red here

p{color:blue;margin:30px}. Spacey blue

p[fr]. rouge

<!-- Phrase attributes -->
I seriously *{color:red}blushed*
when I _(big)sprouted_ that
corn stalk from my
%[es]cabeza%.

<!-- Phrase alignments and indentation -->
p<. align left

p>. align right

p=. centered

p<>. justified

p(. left ident 1em

p((. left ident 2em

p))). right ident 3em

<!-- Attributes and alignments combined -->
h2()>. Bingo.

h3()>[no]{color:red}. Bingo

<!-- Lists -->
# First item
# Second item
# Third

# Fuel could be:
## Coal
## Gasoline
## Electricity
# Humans need only:
## Water
## Protein

* First item
* Second item
* Third

* Fuel could be:
** Coal
** Gasoline
** Electricity
* Humans need only:
** Water
** Protein

#(foo) List can have attributes too
#{background: red} Red item

<!-- Links and images -->
I searched "Google":http://google.com.

I am crazy about "Hobix":hobix
and "it's":hobix "all":hobix I ever
"link to":hobix!

[hobix]http://hobix.com

And "(some-link)[en]links":# can have attributes too!

!http://redcloth.org/hobix.com/textile/sample.jpg!
!openwindow1.gif(Bunny.)!
!openwindow1.gif!:http://hobix.com/

!>obake.gif!

And others sat all round the small
machine and paid it to sing to them.

<!-- Tables -->
| name | age | sex |
| joan | 24 | f |
| archie | 29 | m |
| bella | 45 | f |

|_. name |_. age |_. sex |
| joan | 24 | f |
| archie | 29 | m |
| bella | 45 | f |

|_. attribute list |
|<. align left |
|>. align right|
|=. center |
|<>. justify |
|^. valign top |
|~. bottom |

|\\2. spans two cols |
| col 1 | col 2 |

|/3. spans 3 rows | a |
| b |
| c |

|{background:#ddd}. Grey cell|

table{border:1px solid black}.
|This|is|a|row|
|This|is|a|row|

|This|is|a|row|
{background:#ddd}. |This|is|grey|row|
`,
	toml: `# Full example
# This is a comment

key = "value"
paths.home = 'c:\\foo\\'

[database.prod]
server = "192.168.1.1"
ports = [ 8001, 8001, 8002 ]
connection_max = 5000
enabled = true


[[users]]
name = "John"
bday = 1995-09-22
bio = ""
interests = [ "biking", "fishing" ]

[[users]]
name = "Jane"
bday = 1989-05-09
bio = """\\
Hi!

I love programming!\\
"""
interests = [ "programming" ]
`,
	tremor: `# Comments
# Single line comment
### Module level documentation comment
## Statement level documentation comment
# Regular code comment

# Strings
# double quote single line strings
"foo \\"bar\\" baz"

# heredocs or multiline strings
"""
{ "snot": "badger" }
"""

# Variables
# Immutable constants
const snot = "fleek";

# Mutable variables
let badger = "flook";

# Operators
merge {} of
	{ "snot": "badger" }
end;

patch {} of
	insert snot = "badger"
end;

# Functions and keywords
fn fib_(a, b, n) of
case (a, b, n) when n > 0 => recur(b, a + b, n - 1)
default => a
end;

fn fib(n) with
fib_(0, 1, n)
end;

fib(event)

# Queries
define script fib
	script
		fn fib_(a, b, n) of
			case (a, b, n) when n > 0 => recur(b, a + b, n - 1)
			default => a
		end;

		fn fib(n) with
			fib_(0, 1, n)
		end;

		{ "fib": fib(event.n) }
	end;

	create script fib;
	select event.n from in into fib;
	select event from fib into out;

# Deployments
define pipeline passthrough
pipeline
	select event from in into out;
end;

deploy pipeline passthrough;
`,
	tt2: `[%# Comments %]
[%# this entire directive is ignored no
	matter how many lines it wraps onto
%]
[% # this is a comment
	theta = 20      # so is this
	rho   = 30      # <aol>me too!</aol>
%]

[%# Variables %]
[% text %]
[% article.title %]
[%= eat.whitespace.left %]
[% eat.whitespace.right =%]
[%= eat.whitespace.both =%]
[% object.method() %]

[%# Conditionals and Loops %]
[% IF foo = bar %]
this
[% ELSE %]
that
[% END %]
[% FOREACH post IN q.listPosts(lingua = "de") %]
	<a href="[% post.permalink %]">[% post.title | html %]</a>
[% END %]

[%# Multiple Directives %]
[% IF title;
		INCLUDE header;
	ELSE;
		INCLUDE other/header  title="Some Other Title";
	END
%]

[%# Operators %]
[% FOREACH post IN q.listPosts(lingua => 'de') %]
	[% post.title | myfilter(foo = "bar") %]
[% END %]
`,
	turtle: `# Full example
@base <http://example.org/> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix rel: <http://www.perceive.net/schemas/relationship/> .

GRAPH <urn:myGraph> {
<#green-goblin>
	rel:enemyOf <#spiderman> ;
	a foaf:Person ;    # in the context of the Marvel universe
	foaf:name "Green Goblin" .

<#spiderman>
	rel:enemyOf <#green-goblin> ;
	a foaf:Person ;
	foaf:name "Spiderman", "Человек-паук"@ru .
}
`,
	twig: `{# Comments #}
{# Some comment
on multiple lines
with <html></html>
inside #}

{# Keywords #}
{% if foo %} bar {% endif %}
{% for key, value in arr if value %} {{ do_something() }} {% endfor %}
{% include 'header.html' %}
{% include 'template.html' with {'foo': 'bar'} %}

{# Operators #}
{{ not a }}
{{ 20 // 7 }}
{{ b b-and c }}
{% if phone matches '/^[\\\\d\\\\.]+$/' %} ... {% endif %}

{# Twig embedded in HTML #}
<div>
{% if foo %}
	<p>Foo!</p>
{% else %}
	<p>Not foo...</p>
{% endif %}
`,
	typoscript: `// Typical TypoScript Setup File
# import other files
@import 'EXT:fluid_styled_content/Configuration/TypoScript/setup.typoscript'
@import 'EXT:sitepackage/Configuration/TypoScript/Helper/DynamicContent.typoscript'

page = PAGE
page {
	typeNum = 0

	// setup templates
	10 = FLUIDTEMPLATE
	10 {
		templateName = TEXT
		templateName.stdWrap.cObject = CASE
		templateName.stdWrap.cObject {
			key.data = pagelayout

			pagets__sitepackage_default = TEXT
			pagets__sitepackage_default.value = Default

			pagets__sitepackage_alternate = TEXT
			pagets__sitepackage_alternate.value = Alternative

			default = TEXT
			default.value = Default
		}
		
		templateRootPaths {
			0 = EXT:sitepackage/Resources/Private/Templates/Page/
			1 = {$sitepackage.fluidtemplate.templateRootPath}
		}
		
		partialRootPaths {
			0 = EXT:sitepackage/Resources/Private/Partials/Page/
			1 = {$sitepackage.fluidtemplate.partialRootPath}
		}
		
		layoutRootPaths {
			0 = EXT:sitepackage/Resources/Private/Layouts/Page/
			1 = {$sitepackage.fluidtemplate.layoutRootPath}
		}

		dataProcessing {
			10 = TYPO3\\CMS\\Frontend\\DataProcessing\\MenuProcessor
			10 {
				levels = 1
				includeSpacer = 1
				as = mainnavigation
			}
		}
	}

	// include css into head
	includeCSS {
		bootstrap = https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css
		bootstrap.external = 1
		website = EXT:sitepackage/Resources/Public/Css/styles.css
	}

	// include js into footer
	includeJSFooter {
		jquery = https://code.jquery.com/jquery-3.2.1.slim.min.js
		jquery.external = 1
		bootstrap = https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js
		bootstrap.external = 1
		website = EXT:sitepackage/Resources/Public/JavaScript/scripts.js
	}
}

// global site configuration
config {
	absRefPrefix = auto
	cache_period = 86400
	debug = 0
	disablePrefixComment = 1
	doctype = html5
	extTarget =
	index_enable = 1
	index_externals = 1
	index_metatags = 1
	inlineStyle2TempFile = 1
	intTarget =
	linkVars = L
	metaCharset = utf-8
	no_cache = 0
	pageTitleFirst = 1
	prefixLocalAnchors = all
	removeDefaultJS = 0
	sendCacheHeaders = 1
	compressCss = 0
	compressJs = 0
	concatenateCss = 0
	concatenateJs = 0
}
`,
	typescript: `// Full example
interface SearchFunc {
	(source: string, subString: string): boolean;
}

var mySearch: SearchFunc;
mySearch = function(source: string, subString: string) {
	var result = source.search(subString);
	if (result == -1) {
		return false;
	}
	else {
		return true;
	}
}

class Greeter {
	greeting: string;
	constructor(message: string) {
		this.greeting = message;
	}
	greet() {
		return "Hello, " + this.greeting;
	}
}

var greeter = new Greeter("world");
`,
	unrealscript: `// Full example
// Source: https://github.com/Jusas/XCOM2_ReconSoldierClass/blob/master/ReconOperatorSoldierClass/Src/ReconSoldierClass/Classes/ReconOperator_AcademyUnlocks.uc

class ReconOperator_AcademyUnlocks extends X2StrategyElement;

static function array<X2DataTemplate> CreateTemplates()
{
	local array<X2DataTemplate> Templates;

	Templates.AddItem(AdrenalineUnlock());

	return Templates;
}

static function X2SoldierAbilityUnlockTemplate AdrenalineUnlock()
{
	local X2SoldierAbilityUnlockTemplate Template;
	local ArtifactCost Resources;

	\`CREATE_X2TEMPLATE(class'X2SoldierAbilityUnlockTemplate', Template, 'ReconAdrenalineUnlock');

	Template.AllowedClasses.AddItem('ReconSoldierClass');
	Template.AbilityName = 'ReconAdrenalineSpike';
	Template.strImage = "img:///UILibrary_ReconOperator.GTS.GTS_adrenaline";

	// Requirements
	Template.Requirements.RequiredHighestSoldierRank = 5;
	Template.Requirements.RequiredSoldierClass = 'ReconSoldierClass';
	Template.Requirements.RequiredSoldierRankClassCombo = true;
	Template.Requirements.bVisibleIfSoldierRankGatesNotMet = true;

	// Cost
	Resources.ItemTemplateName = 'Supplies';
	Resources.Quantity = 75;
	Template.Cost.ResourceCosts.AddItem(Resources);

	return Template;
}
`,
	uorazor: `# Full example
# UO Razor Script Highlighting by Jaseowns
// These two are comments
// Example script:
setvar "my_training_target"
while skill "anatomy" < 100
	useskill "anatomy"
	wft 500
	target "my_training_target"
	wait 2000
endwhile
`,
	uri: `Full example
https://john.doe@www.example.com:123/forum/questions/?tag=networking&order=newest#top
https://example.com/path/resource.txt#fragment
ldap://[2001:db8::7]/c=GB?objectClass?one
mailto:John.Doe@example.com
news:comp.infosystems.www.servers.unix
tel:+1-816-555-1212
telnet://192.0.2.16:80/
urn:oasis:names:specification:docbook:dtd:xml:4.1.2
//example.com/path/resource.txt
/path/resource.txt
path/resource.txt
`,
	v: `// Comments
// This is a comment
/* This is a comment
on multiple lines */

// Numbers
123
0x7B
0b01111011
0o173
170141183460469231731687303715884105727
1_000_000
0b0_11
3_122.55
0xF_F
0o17_3
72.40
072.40
2.71828

// Runes and strings
'\\t'
'\\000'
'\\x07'
'\\u12e4'
'\\U00101234'
\`abc\`
\`multi-line
string\`
"Hello, world!"
"multi-line
string"

// String interpolation
'Hello, $name!'
"age = $user.age"
'can register = \${user.age > 13}'
'x = \${x:4.2f}'
'[\${x:10}]'
'[\${int(x):-10}]'

// Struct
struct Foo {
	a int   // private immutable (default)
mut:
	b int   // private mutable
	c int   // (you can list multiple fields with the same access modifier)
pub:
	d int   // public immutable (readonly)
pub mut:
	e int   // public, but mutable only in parent module
__global:
	f int   // public and mutable both inside and outside parent module
}           // (not recommended to use, that's why the 'global' keyword
			// starts with __)

// Functions
func(a, b int, z float64) bool { return a*b < int(z) }

// Full example
module mymodule

import external_module

fn sqr(n int) int {
	return n * n
}

fn run(value int, op fn (int) int) int {
	return op(value)
}

fn main() {
	println(run(5, sqr)) // "25"
	// Anonymous functions can be declared inside other functions:
	double_fn := fn (n int) int {
		return n + n
	}
	println(run(5, double_fn)) // "10"
	// Functions can be passed around without assigning them to variables:
	res := run(5, fn (n int) int {
		return n + n
	})

	external_module.say_hi()
}
`,
	vala: `// Comments
// Single line comment
/** Multi-line
doc comment */

// Strings
"foo \\"bar\\" baz"
"Multi-line strings ending with a \\
are supported too."
"""Verbatim strings
You can create
multi-line strings like this too."""
@"Template string with variables $var1 $(var2 * 2)"

// Regex
/foo?[ ]*bar/

// Full example
using Gtk;

int main (string[] args) {
	Gtk.init(ref args);

	var window = new Window();

	var button = new Button.with_label("Click me!");

	window.add(button);
	window.show_all();

	Gtk.main();
	return 0;
}
`,
	vbnet: `' Comments
!foobar
REM foobar
'foobar

' Example
Public Function findValue(ByVal arr() As Double,
	ByVal searchValue As Double) As Double
	Dim i As Integer = 0
	While i <= UBound(arr) AndAlso arr(i) <> searchValue
		' If i is greater than UBound(arr), searchValue is not checked.
		i += 1
	End While
	If i > UBound(arr) Then i = -1
	Return i
End Function

' XMLDoc
''' <summary>
''' Summary documentation goes here.
''' </summary>
`,
	velocity: `## Comments
## Single line comment
#* Multi-line
comment *#

## Unparsed sections
## Section below is not parsed
#[[
	## This is not a comment
]]#

## Variables
$mud
$customer.Name
$flogger.getPromo( $mud )
$!{mudSlinger_9}
$foo[0]
$foo[$i]
$foo["bar"]
$foo.bar[1].junk
$foo.callMethod()[1]

## Directives
#set($foo.bar[1] = 3)
#if($a==1)true enough#{else}no way!#end
#macro( d )
<tr><td>$!bodyContent</td></tr>
#end
#@d()Hello!#end

## Integration with HTML
<html>
	<body>
		Hello $customer.Name!
		<table>
		#foreach( $mud in $mudsOnSpecial )
			#if ( $customer.hasPurchased($mud) )
				<tr>
					<td>
						$flogger.getPromo( $mud )
					</td>
				</tr>
			#end
		#end
		</table>
	</body>
</html>
`,
	verilog: `// Comments
/* Multiline comments in Verilog
	 look like C comments and // is OK in here. */
// Single-line comment in Verilog.

// Literals
// example code from: http://iroi.seu.edu.cn/books/asics/Book2/CH11/CH11.02.htm
module declarations;
	parameter H12_UNSIZED = 'h 12;
	parameter H12_SIZED = 6'h 12;
	parameter D42 = 8'B0010_1010;
	parameter D123 = 123;
	parameter D63 = 8'o 77;
	parameter A = 'h x, B = 'o x, C = 8'b x, D = 'h z, E = 16'h ????;
	reg [3:0] B0011,Bxxx1,Bzzz1;
	real R1,R2,R3;
	integer I1,I3,I_3;
	parameter BXZ = 8'b1x0x1z0z;

	initial begin
		B0011 = 4'b11; Bxxx1 = 4'bx1; Bzzz1 = 4'bz1;
		R1 = 0.1e1; R2 = 2.0; R3 = 30E-01;
		I1 = 1.1; I3 = 2.5; I_3 = -2.5;
	end

	initial begin #1;
		$display("H12_UNSIZED, H12_SIZED (hex) = %h, %h",H12_UNSIZED, H12_SIZED);
		$display("D42 (bin) = %b",D42," (dec) = %d",D42);
		$display("D123 (hex) = %h",D123," (dec) = %d",D123);
		$display("D63 (oct) = %o",D63);
		$display("A (hex) = %h",A," B (hex) = %h",B);
		$display("C (hex) = %h",C," D (hex) = %h",D," E (hex) = %h",E);
		$display("BXZ (bin) = %b",BXZ," (hex) = %h",BXZ);
		$display("B0011, Bxxx1, Bzzz1 (bin) = %b, %b, %b",B0011,Bxxx1,Bzzz1);
		$display("R1, R2, R3 (e, f, g) = %e, %f, %g", R1, R2, R3);
		$display("I1, I3, I_3 (d) = %d, %d, %d", I1, I3, I_3);
	end
endmodule

// Full example
\`include "internal_defines.vh"

//*****************************************************************************
// memory_decoder: a custom module used to handle memory transactions
//*****************************************************************************
//
// out_mem (output) - The output to memory
// out_reg (output) - The output to the register file
// mem_we  (output) - Which byte in the word to write too
// mem_in  (input)  - The input from memory
// addr_in (input)  - The lowest 2 bits of byte offset to store in memory
// data_in (input)  - The input from the register file to be stored
// l_bit   (input)  - The load bit signal (control)
// b_bit   (input)  - The byte bit signal (control)
//
module memory_decoder(out_mem, out_reg, mem_in, data_in, l_bit, b_bit, addr_in,
											mem_we);

	output reg  [31:0]  out_mem, out_reg;
	output reg  [3:0]   mem_we;
	input       [31:0]  mem_in, data_in;
	input       [1:0]   addr_in;
	input               l_bit, b_bit;

	always_comb begin
		mem_we = 4'b0000;     // dont write memory by default
		if (l_bit == 1) begin // ldr and ldrb
			out_mem = mem_in;   // dont change memory!
			if (b_bit == 1) begin
				/* figure out which byte to load from memory */
				case (addr_in)
					2'b00: out_reg = {24'b00, mem_in[7:0]};
					2'b01: out_reg = {24'b00, mem_in[15:8]};
					2'b10: out_reg = {24'b00, mem_in[23:16]};
					2'b11: out_reg = {24'b00, mem_in[31:24]};
				endcase
			end
			else begin
				out_reg = mem_in;
			end
		end
		else begin            // str and strb
			out_reg = \`UNKNOWN; // We are not reading from mem
			if (b_bit == 1) begin
				/* figure out which byte to write to in memory */
				out_mem = {4{data_in[7:0]}};
				case (addr_in)
					2'b00: mem_we = 4'b1000;
					2'b01: mem_we = 4'b0100;
					2'b10: mem_we = 4'b0010;
					2'b11: mem_we = 4'b0001;
				endcase
			end
			else begin
				mem_we = 4'b1111; // write to all channels
				out_mem = data_in;
			end
		end
	end

endmodule
`,
	vhdl: `-- Comments
-- I am a comment
I am not

-- Literals
constant FREEZE : integer := 32;
constant TEMP : real := 32.0;
A_INT <= 16#FF#;
B_INT <= 2#1010_1010#;
MONEY := 1_000_000.0;
FACTOR := 2.2E-6;
constant DEL1 :time := 10 ns;
constant DEL2 :time := 2.27 us;
type MY_LOGIC is ('X','0','1','Z');
type T_STATE is (IDLE, READ, END_CYC);
signal CLK : MY_LOGIC := '0';
signal STATE : T_STATE := IDLE;
constant FLAG :bit_vector(0 to 7) := "11111111";
constant MSG : string := "Hello";
BIT_8_BUS <= B"1111_1111";
BIT_9_BUS <= O"353";
BIT_16_BUS <= X"AA55";
constant TWO_LINE_MSG : string := "Hello" & CR & "World";

-- Full example
-- example code from: http://www.csee.umbc.edu/portal/help/VHDL/samples/samples.html
library IEEE;
use IEEE.std_logic_1164.all;

entity fadd is               -- full adder stage, interface
	port(a    : in  std_logic;
			 b    : in  std_logic;
			 cin  : in  std_logic;
			 s    : out std_logic;
			 cout : out std_logic);
end entity fadd;

architecture circuits of fadd is  -- full adder stage, body
begin  -- circuits of fadd
	s <= a xor b xor cin after 1 ns;
	cout <= (a and b) or (a and cin) or (b and cin) after 1 ns;
end architecture circuits; -- of fadd

library IEEE;
use IEEE.std_logic_1164.all;
entity add32 is             -- simple 32 bit ripple carry adder
	port(a    : in  std_logic_vector(31 downto 0);
			 b    : in  std_logic_vector(31 downto 0);
			 cin  : in  std_logic;
			 sum  : out std_logic_vector(31 downto 0);
			 cout : out std_logic);
end entity add32;

architecture circuits of add32 is
	signal c : std_logic_vector(0 to 30); -- internal carry signals
begin  -- circuits of add32
	a0: entity WORK.fadd port map(a(0), b(0), cin, sum(0), c(0));
	stage: for I in 1 to 30 generate
						 as: entity WORK.fadd port map(a(I), b(I), c(I-1) , sum(I), c(I));
				 end generate stage;
	a31: entity WORK.fadd port map(a(31), b(31), c(30) , sum(31), cout);
end architecture circuits;  -- of add32

use STD.textio.all;
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.std_logic_textio.all;

entity signal_trace is
end signal_trace;

architecture circuits of signal_trace is
	signal a:    std_logic_vector(31 downto 0) := x"00000000";
	signal b:    std_logic_vector(31 downto 0) := x"FFFFFFFF";
	signal cin:  std_logic := '1';
	signal cout: std_logic;
	signal sum:  std_logic_vector(31 downto 0);
begin  -- circuits of signal_trace
	adder: entity WORK.add32 port map(a, b, cin, sum, cout); -- parallel circuit

	prtsum: process (sum)
						variable my_line : LINE;
						alias swrite is write [line, string, side, width] ;
					begin
						swrite(my_line, "sum=");
						write(my_line, sum);
						swrite(my_line, ",  at=");
						write(my_line, now);
						writeline(output, my_line);
					end process prtsum;

end architecture circuits; -- of signal_trace
`,
	vim: `" Comments
" This is a comment

" Variables
set softab = 2
map <leader>tn :tabnew

" Map
mystring = :steveT;

" Functions
func! DeleteTrailingWS()
	exe "normal mz"
	%s/\\s\\+$//ge
	exe "normal \`z"
endfunc

" Logic
if has("mac")
	nmap <D-j> <M-j>
endif
`,
	"visual-basic": `' Comments
' Comment
REM This is a comment too

' Strings and characters
"Foo""bar"
“”
"a"c

' Dates and times
# 8/23/1970 3:45:39AM #
#8/23/1970 #
# 3:45:39AM #
# 3:45:39#
# 13:45:39 #
# 1AM #
# 13:45:39PM #

' Numbers
42S
.369E+14
3.1415R

' Preprocessing directives
#ExternalChecksum("c:\\wwwroot\\inetpub\\test.aspx", _
	"{12345678-1234-1234-1234-123456789abc}", _
	"1a2b3c4e5f617239a49b9a9c0391849d34950f923fab9484")

' Keywords
Function AddNumbers(ByVal X As Integer, ByVal Y As Integer)
	AddNumbers = X + Y
End Function
Module Test
	Sub Main()
	End Sub
End Module
`,
	vue: `<!-- Component script (try changing the lang attribute) -->
<script lang="ts" setup>
import { ref } from "vue"

const seen = ref(true)
const someAttr = ref("class")
const attrValue = ref("name")
const value = ref("value")

const items: string[] = [/* ... */]

function doSomething() {}
</script>

<!-- Template -->
<template>
	<!-- Normal element -->
	<div class="name"> ... </div>

	<!-- Vue directives -->
	<p v-if="seen">Now you see me</p>

	<!-- Attribute bindings -->
	<input :value="value">

	<!-- Events -->
	<button @click="doSomething"> ... </button>

	<!-- Event modifiers -->
	<form @submit.prevent="onSubmit"> ... </form>

	<!-- Dynamic attributes -->
	<a :[someAttr]="attrValue"> ... </a>

	<ul>
		<li v-for="(item, index) in items">
			<!-- JS/TS Expression -->
			Item {{ index as string }}: {{ item }}
		</li>
	</ul>
</template>

<!-- Normal style element -->
<style scoped>
div {
	color: red;
}
</style>

<!-- Style element with SCSS -->
<style lang="scss">
$primary-color: #333;
body {
	color: $primary-color;
}
</style>
`,
	warpscript: `// Full example
// Source: https://www.warp10.io/content/04_Tutorials/01_WarpScript/05_Best_Practices

//factorial macro. take a number on the stack, push its factorial
<%
	'input' STORE
	1
	1 $input <% * %> FOR
%> 'factorial' STORE

//build a map with key from 1 to 10 and value = key!
{} 'result' STORE

1 10
<%
	'key' STORE
	$result $key @factorial $key PUT
	DROP //remove the map let by PUT
%> FOR

//push the result on the stack
$result
`,
	wasm: `;; Comments
;; Single line comment
(; Multi-line
comment ;)

;; Strings
""
"Foobar"
"Foo\\"ba\\\\r"

;; Numbers
42
3.1415
0.4E-4
-3.1_41_5
0xBADFACE
0xB_adF_a_c_e
+0x4E.F7
0xFFp+4
inf
nan
nan:0xf4

;; Keywords
(func (param i32) (param f32) (local f64)
	get_local 0
	get_local 1
	get_local 2)

;; Identifiers
$p
$getAnswer
$return_i32

;; Full example
(module
	(import "js" "memory" (memory 1))
	(import "js" "table" (table 1 anyfunc))
	(elem (i32.const 0) $shared0func)
	(func $shared0func (result i32)
		i32.const 0
		i32.load)
)
`,
	"web-idl": `// Full example
[Exposed=Window]
interface Paint { };

[Exposed=Window]
interface SolidColor : Paint {
	attribute double red;
	attribute double green;
	attribute double blue;
};

[Exposed=Window]
interface Pattern : Paint {
	attribute DOMString imageURL;
};

[Exposed=Window]
interface GraphicalWindow {
	constructor();
	readonly attribute unsigned long width;
	readonly attribute unsigned long height;

	attribute Paint currentPaint;

	undefined drawRectangle(double x, double y, double width, double height);

	undefined drawText(double x, double y, DOMString text);
};
`,
	wgsl: `// Full example
// Vertex shader
struct CameraUniform {
	view_proj: mat4x4<f32>;
};
[[group(1), binding(0)]]
var<uniform> camera: CameraUniform;

struct InstanceInput {
	[[location(5)]] model_matrix_0: vec4<f32>;
	[[location(6)]] model_matrix_1: vec4<f32>;
	[[location(7)]] model_matrix_2: vec4<f32>;
	[[location(8)]] model_matrix_3: vec4<f32>;
};

struct VertexInput {
	[[location(0)]] position: vec3<f32>; 
	[[location(1)]] tex_coords: vec2<f32>;
};

struct VertexOutput {
	[[builtin(position)]] clip_position: vec4<f32>;
	[[location(0)]] tex_coords: vec2<f32>;
};

@vertex
[[stage(vertex)]]
fn vs_main(
	model: VertexInput,
	instance: InstanceInput,
) -> VertexOutput {
	let model_matrix = mat4x4<f32>(
		instance.model_matrix_0,
		instance.model_matrix_1,
		instance.model_matrix_2,
		instance.model_matrix_3,
	);

	bool mybool1 = true;
	bool mybool2 = false;

	var out: VertexOutput;
	out.tex_coords = model.tex_coords;
	out.clip_position = camera.view_proj * model_matrix * vec4<f32>(model.position, 1.0);
	return out;
}

// Fragment shader

[[group(0), binding(0)]]
var t_diffuse: texture_2d<f32>;
[[group(0), binding(1)]]
var s_diffuse: sampler;

@fragment
[[stage(fragment)]]
fn fs_main(in: VertexOutput) -> [[location(0)]] vec4<f32> {
	return textureSample(t_diffuse, s_diffuse, in.tex_coords);
}
`,
	wiki: `/* Embedded markup */
Paragraphs can be forced in lists by using HTML tags.
Two line break symbols, <code><nowiki><br /><br /></nowiki></code>, will create the desired effect. So will enclosing all but the first paragraph with <code><nowiki><p>...</p></nowiki></code>

/* Headings */
= Header 1 =
== Header 2 ==
=== Header 3 ===
==== Header 4 ====
===== Header 5 =====
====== Header 6 ======

/* Bold and italic */
'''''Both bold and italic'''''
'''Only bold'''
''Only italic''

/* Links and Magic links */
[[w:en:Formal_grammar|Formal grammar]]
[http://www.cl.cam.ac.uk/~mgk25/iso-ebnf.html EBNF help]

ISBN 1234567890
ISBN 123456789x
ISBN      1 2 3-4-5 6789 X
ISBN 978-9999999999

RFC 822
PMID 822

/* Magic words and special symbols */
#REDIRECT [[somewhere]]

{{SITENAME}}
{{PAGESINCATEGORY:category}}
{{#dateformat:2009-12-25|mdy}}

__NOTOC__

{{!}}

~~~ ~~~~ ~~~~~

/* Lists */
* Lists are easy to do:
** start every line
* with a star
** more stars mean
*** deeper levels

# Numbered lists are good
## very organized
## easy to follow

; Definition lists
; item : definition
; semicolon plus term
: colon plus definition

* Or create mixed lists
*# and nest them
*#* like this
*#*; definitions
*#*: work:
*#*; apple
*#*; banana
*#*: fruits

/* Tables */
{|
|Orange
|Apple
|-
|Bread
|Pie
|-
|Butter
|Ice cream
|}

{|
|Lorem ipsum dolor sit amet,
consetetur sadipscing elitr,
sed diam nonumy eirmod tempor invidunt
ut labore et dolore magna aliquyam erat,
sed diam voluptua.

At vero eos et accusam et justo duo dolores
et ea rebum. Stet clita kasd gubergren,
no sea takimata sanctus est Lorem ipsum
dolor sit amet.
|
* Lorem ipsum dolor sit amet
* consetetur sadipscing elitr
* sed diam nonumy eirmod tempor invidunt
|}

{|
|  Orange    ||   Apple   ||   more
|-
|   Bread    ||   Pie     ||   more
|-
|   Butter   || Ice cream ||  and more
|}

{|
! style="text-align:left;"| Item
! Amount
! Cost
|-
|Orange
|10
|7.00
|-
|Bread
|4
|3.00
|-
|Butter
|1
|5.00
|-
!Total
|
|15.00
|}

{|
! style="text-align:left;"| Item !! style="color:red;"| Amount !! Cost
|-
|Orange
|10
|7.00
|-
| style="text-align:right;"| Bread
|4
|3.00
|-
|Butter
|1
|5.00
|-
!Total
|
|15.00
|}
`,
	wolfram: `(* Comments *)
(* This is a comment *)

(* Strings *)
"foo bar baz"

(* Numbers *)
7
3.14
10.
.001
1e100
3.14e-10
2147483647

(* Full example *)
(* Most operators are supported *)
f /@ {1, 2, 3};
f @@ Range[10];
f @@@ y;
Module[{x=1}, 
	Return @ $Failed
]
`,
	wren: `// Full example
// Source: https://wren.io/

System.print("Hello, world!")

class Wren {
	flyTo(city) {
		System.print("Flying to %(city)")
	}
}

var adjectives = Fiber.new {
	["small", "clean", "fast"].each {|word| Fiber.yield(word) }
}

while (!adjectives.isDone) System.print(adjectives.call())
`,
	xeora: `<!-- Special Constants -->
$DomainContents$
$PageRenderDuration$

<!-- Operators & Variables -->
$SearchKey$
$^SearchKey$
$~SearchKey$
$-SearchKey$
$+SearchKey$
$=SearchKey$
$#SearchKey$
$##SearchKey$

$*SearchKey$

$@SearchObject.SearchProperty$
$@#SearchObject.SearchProperty$
$@-SearchObject.SearchProperty$

<!-- Controls -->
$C:ControlID$
$C:ControlID:{ <!-- Something --> }:ControlID$
$C:ControlID:{ <!-- Something --> }:ControlID:{ <!-- Something (Alternative) --> }:ControlID$

Control with Parent
$C[Control1]:Control2$
$C[Control2]:Control3:{ <!-- Something --> }:Control3$
$C[Control2]:Control3:{ <!-- Something --> }:Control3:{ <!-- Something (Alternative) --> }:Control3$

Control with Parent & Leveling
$C#1[ParentControlID]:ControlID:{ <!-- Something --> }:ControlID$

All Control Tags has leveling specification;
$C:LoopControl1:{
	$#FirstLoopSQLField1$

	$C:ControlID:{ <!-- Something --> }:ControlID$

	$C:LoopControl2:{
		$##FirstLoopSQLField1$
		$#SecondLoopSQLField1$

		$C#1:ControlID:{ <!-- Something --> }:ControlID$
	}:LoopControl2$
}:LoopControl1$

XML setup on a Control in Controls.xml
<Control id="[ControlID]">
	<Type>[ControlType]</Type>

	<Bind>[ThemeID|AddonID]?[ControlClass].[FunctionName],SomeOperatorTags(seperated with |)</Bind>

	<BlockIDsToUpdate localupdate="True|False">
		<BlockID>[BlockID]</BlockID>
		<BlockID>[BlockID]</BlockID>
		<BlockID>[BlockID]</BlockID>
	</BlockIDsToUpdate>

	<DefaultButtonID>[ControlID]</DefaultButtonID>

	<Text>[TextBox, Password value or Button Text]</Text>

	<Content>[Textarea Content]</Content>

	<Source>[Image URL]</Source>

	<Url>[Link URL]</Url>

	<Attributes>
		<Attribute key="[HTMLAttributeKey]">[AttributeValue]</Attribute>
	</Attributes>
</Control>

<!-- Directives -->
$T:TemplateID$
$L:TranslationID$
$P:TemplateID$

<!-- Executable Functions -->
$F:AddonLib1?GlobalControls.PrintOutSums$
$F:AddonLib1?GlobalControls.PrintOut,~FormField$
$F:AddonLib1?GlobalControls.SumNumbers,~FormField|=5$

<!-- Client Side Function Binding -->
$XF:{AddonLib1?GlobalControls.SumNumbers,~FormField|=5}:XF$

<!-- Inline Statements -->
$S:StatementID:{ <!-- C# Code --> }:StatementID$
$S:StatementID:{!NOCACHE <!-- C# Code --> }:StatementID$

$S:Statement1:{
	int intvalue1 = 5;
	int intvalue2 = Integer.Parse("0" + $~FormValue$);

	return intvalue1 * intvalue2;
}:Statement1$

<!-- Request Blocks -->
$H:RequestBlockID:{ <!-- Something --> }:RequestBlockID$
$H:RequestBlockID:{!RENDERONREQUEST <!-- Something --> }:RequestBlockID$

<!-- Cache Block -->
$PC:{ <!-- Page Content Part --> }:PC$

<!-- Message Handling Block -->
$MB:{ <!-- Message Output Content --> }:MB$
$MB:{
	$#Message$
	$#MessageType$
}:MB$
`,
	xml: `<!-- Empty tag -->
<p></p>

<!-- Tag that spans multiple lines -->
<p
>hello!
</p>

<!-- Name-attribute pair -->
<p></p>

<!-- Name-attribute pair without quotes -->
<p class=prism></p>

<!-- Attribute without value -->
<p data-foo></p>
<p data-foo ></p>

<!-- Namespaces -->
<html:p foo:bar="baz" foo:weee></html:p>

<!-- XML prolog -->
<?xml version="1.0" encoding="utf-8"?>
<svg></svg>

<!-- DOCTYPE -->
<!DOCTYPE html>
<html></html>

<!-- CDATA section -->
<ns1:description><![CDATA[
  CDATA is <not> magical.
]]></ns1:description>

<!-- Comment -->
<!-- I'm a comment -->
And i'm not

<!-- Entities -->
&amp; &#x2665; &#160; &#x152;

<!-- XML tags with non-ASCII characters -->
<Läufer>foo</Läufer>
<tag läufer="läufer">bar</tag>
<läufer:tag>baz</läufer:tag>
`,
	xojo: `// Comments
' This is a comment
// This is a comment too
Rem This is a remark

// Strings
""
"foo ""bar"" baz"

// Numbers and colors
42
3.14159
3E4
&b0110
&cAABBCCDD
&hBadFace
&o777
&u9

// Example
Dim g As Graphics
Dim yOffSet As Integer
g = OpenPrinterDialog()
If g <> Nil Then
	If MainDishMenu.ListIndex <> -1 Then
		g.Bold = True
		g.DrawString("Main Dish:",20,20)
		g.Bold = False
		g.DrawString(MainDishMenu.Text,100,20)
		g.Bold = True
		g.DrawString("Side Order:",20,40)
		g.Bold = False
		If FriesRadio.Value Then
			g.DrawString(FriesRadio.Caption,100,40)
		End If
		If PotatoRadio.Value Then
			g.DrawString(PotatoRadio.Caption,100,40)
		End If
		If OnionRingRadio.Value Then
			g.DrawString(OnionRingRadio.Caption,100,40)
		End If
		yOffSet = 60
		If CheeseCheckBox.Value Then
			g.Bold = True
			g.DrawString("Extra:",20,yOffSet)
			g.Bold = False
			g.DrawString(CheeseCheckBox.Caption,100,yOffSet)
			yOffSet = yOffSet + 20
		End If
		If BaconCheckBox.Value Then
			g.Bold = True
			g.DrawString("Extra:",20,yOffSet)
			g.Bold = False
			g.DrawString(BaconCheckBox.Caption,100,yOffSet)
			yOffSet = yOffSet + 20
		End If
		g.Bold = True
		g.DrawString("Notes:",20,yOffSet)
		g.Bold = False
		g.DrawString(NotesField.Text,100,yOffSet,(g.Width-40))
	End If
End If
`,
	xquery: `(: Comments :)
(::)
(: Comment :)
(: Multi-line
comment :)
(:~
: The <b>functx:substring-after-last</b> function returns the part
: of <b>$string</b> that appears after the last occurrence of
: <b>$delim</b>. If <b>$string</b> does not contain
: <b>$delim</b>, the entire string is returned.
:
: @param $string the string to substring
: @param $delim the delimiter
: @return the substring
:)

(: Variables :)
$myProduct
$foo-bar
$strings:LetterA

(: Functions :)
document-node(schema-element(catalog))
strings:trim($arg as xs:string?)
false()

(: Keywords :)
xquery version "1.0";
declare default element namespace "http://datypic.com/cat";
declare boundary-space preserve;
declare default collation "http://datypic.com/collation/custom";

(: Types :)
xs:anyAtomicType
element
xs:double

(: Full example :)
<report xmlns="http://datypic.com/report"
xmlns:cat="http://datypic.com/cat"
xmlns:prod="http://datypic.com/prod"> {
	for $product in doc("prod_ns.xml")/prod:product
		return <lineItem>
			{$product/prod:number}
			{$product/prod:name}
		</lineItem>
	}
</report>
`,
	yaml: `# Null and Boolean
---
A null: null
A null: ~
Also a null: # Empty
Not a null: ""
Booleans: [ true, True, false, FALSE ]

# Numbers and timestamps
---
Integers: [ 0, -0, 3, 0o7, 0x3A, -19 ]
Floats: [ 0., -0.0, .5, 12e03, +12e03, -2E+05 ]
Also floats: [ .inf, -.Inf, +.INF, .NAN ]
Timestamps:
	canonical: 2001-12-15T02:59:43.1Z
	iso8601: 2001-12-14t21:59:43.10-05:00
	spaced: 2001-12-14 21:59:43.10 -5
	date: 2002-12-14
	times:
		- 10:53
		- 10:53:20.53

# Strings
---
product: High Heeled "Ruby" Slippers
description: "Putting on these \\"slippers\\" is easy."
address:
	city:   East Centerville
	street: !!str |
		123 Tornado Alley
		Suite 16

	specialDelivery:  >
		Follow the Yellow Brick
		Road to the Emerald City.
		#Pay no attention to the
		man behind the curtain.

# Sequences and maps
---
- Casablanca
- North by Northwest
- {
		name: John Smith, age: 33}
- name: Mary Smith
	age: 27
---
"name": John Smith
age: 33
men: [ John Smith,
		"Bill Jones" ]
women:
 - Mary Smith
 - "Susan Williams"

# Tags
---
!!map {
	? !!str friends: !!seq [
		!!map {
			? !!str "age"
			: !!int 33,
			? !!str "name"
			: !!str "John Smith",
		}
	],
	men:
		[ !!str "John Smith", !!str "Bill Jones"]
}

# Full example
%YAML 1.2
--- !<tag:clarkevans.com,2002:invoice>
invoice: 34843
date   : 2001-01-23
bill-to: &id001
	given  : Chris
	family : Dumars
	address:
		lines: |
			458 Walkman Dr.
			Suite #292
		city    : Royal Oak
		state   : MI
		postal  : 48046
ship-to:
	<<: *id001
	product:
		- sku         : BL394D
			quantity    : 4
			description : Basketball
			price       : 450.00
		- sku         : BL4438H
			quantity    : 1
			description : Super Hoop
			price       : 2392.00
tax  : 251.42
total: 4443.52
comments:
	Late afternoon is best.
	Backup contact is Nancy
`,
	yang: `// Full example
submodule execd-dns {

	belongs-to execd { prefix execd; }

	import inet-types { prefix inet; }

	include execd-types;

	description
		"The 'dns' component provides support for configuring the DNS resolver.

		 The 'domain' keyword of /etc/resolv.conf is not supported, since
		 it is equivalent to 'search' with a single domain. I.e. in terms
		 of the data model, the domains are always configured as 'search'
		 elements, even if there is only one. The set of available options
		 has been limited to those that are generally available across
		 different resolver implementations, and generally useful.";

	revision "2008-11-04" {
		description "draft-ietf-netmod-yang-02 compatible.";
	}
	revision "2007-08-29" {
		description "Syntax fixes after pyang validation.";
	}
	revision "2007-06-08" {
		description "Initial revision.";
	}

	grouping dns {
		list search {
			key name;
			max-elements 3;
			leaf name      { type int32; }
			leaf domain    { type inet:host; }
		}
		list server {
			key address;
			max-elements 3;
			ordered-by user;
			leaf address   { type inet:ip-address; }
		}
		container options {
			leaf ndots    { type uint8; }
			leaf timeout  { type uint8; }
			leaf attempts { type uint8; }
		}
	}
}
`,
	zig: `// Full example
const std = @import("std");

pub fn main() !void {
	// If this program is run without stdout attached, exit with an error.
	const stdout_file = try std.io.getStdOut();
	// If this program encounters pipe failure when printing to stdout, exit
	// with an error.
	try stdout_file.write("Hello, world!\\n");
}

const warn = @import("std").debug.warn;

pub fn main() void {
	warn("Hello, world!\\n");
}

const assert = @import("std").debug.assert;

test "comments" {
	// Comments in Zig start with "//" and end at the next LF byte (end of line).
	// The below line is a comment, and won't be executed.

	//assert(false);

	const x = true;  // another comment
	assert(x);
}

/// A structure for storing a timestamp, with nanosecond precision (this is a
/// multiline doc comment).
const Timestamp = struct {
	/// The number of seconds since the epoch (this is also a doc comment).
	seconds: i64,  // signed so we can represent pre-1970 (not a doc comment)
	/// The number of nanoseconds past the second (doc comment again).
	nanos: u32,

	/// Returns a \`Timestamp\` struct representing the Unix epoch; that is, the
	/// moment of 1970 Jan 1 00:00:00 UTC (this is a doc comment too).
	pub fn unixEpoch() Timestamp {
		return Timestamp{
			.seconds = 0,
			.nanos = 0,
		};
	}
};
`,
} as Record<string, string>
