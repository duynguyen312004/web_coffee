-- Tạo bảng customer
CREATE TABLE customer (
    id serial PRIMARY KEY,
    wallet int NOT NULL DEFAULT 1000000,
    phone varchar(20) NOT NULL UNIQUE,
    password varchar(50) NOT NULL,
    address varchar(100) NOT NULL,
    name varchar(100) NOT NULL,
    role varchar(20) DEFAULT 'Customer'
);

-- Tạo bảng admin
CREATE TABLE admin (
    id serial PRIMARY KEY,
    phone varchar(100) NOT NULL UNIQUE,
    password varchar(255) NOT NULL,
    name varchar(100) NOT NULL,
    role varchar(20) DEFAULT 'ADMIN'
);

-- Tạo bảng product
CREATE TABLE product (
    id serial PRIMARY KEY,
    name varchar(50) NOT NULL,
    price int NOT NULL,
    category varchar(50),
    inventory integer NOT NULL,
    img_path text,
    img_name VARCHAR(225),
    description text
);

-- Tạo bảng order
CREATE TABLE "order" (
    id serial PRIMARY KEY,
    date timestamp NOT NULL,
    total_price int NOT NULL,
    customerid int NOT NULL,
    receiver_phone varchar(20) NOT NULL,
    receiver_address varchar(255) NOT NULL,
    receiver_name varchar(100) NOT NULL,
    FOREIGN KEY (customerid) REFERENCES customer (id)
);

-- Tạo bảng order_detail
CREATE TABLE order_detail (
    id serial PRIMARY KEY,
    unit_price int NOT NULL,
    quantity integer NOT NULL,
    orderid int NOT NULL,
    productid int NOT NULL,
    FOREIGN KEY (orderid) REFERENCES "order" (id),
    FOREIGN KEY (productid) REFERENCES product (id)
);
-- Hàm tính tổng giá trị đơn hàng
CREATE OR REPLACE FUNCTION calculate_total_price(order_id INT)
RETURNS INT AS $$
DECLARE
    total INT;
    shipping_fee INT := 15000; -- Phí ship cố định 15.000 đ
BEGIN
    SELECT SUM(unit_price * quantity) INTO total
    FROM order_detail
    WHERE orderid = order_id;

    RETURN total + shipping_fee;
END;
$$ LANGUAGE plpgsql;

-- Hàm cập nhật tồn kho sản phẩm
CREATE OR REPLACE FUNCTION update_inventory(product_id INT, quantity INT)
RETURNS VOID AS $$
BEGIN
    UPDATE product
    SET inventory = inventory - quantity
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- Hàm cập nhật số dư ví của khách hàng sau khi thanh toán đơn hàng
CREATE OR REPLACE FUNCTION update_customer_wallet(customer_id INT, amount INT)
RETURNS VOID AS $$
BEGIN
    UPDATE customer
    SET wallet = wallet - amount
    WHERE id = customer_id;
END;
$$ LANGUAGE plpgsql;

-- Hàm để kiểm tra số dư ví
CREATE OR REPLACE FUNCTION check_wallet_balance()
RETURNS TRIGGER AS $$
DECLARE
    wallet_balance INT;
BEGIN
    -- Lấy số dư ví của khách hàng
    SELECT wallet INTO wallet_balance
    FROM customer
    WHERE id = NEW.customerid;

    -- Kiểm tra nếu số dư ví không đủ
    IF wallet_balance < NEW.total_price THEN
        RAISE EXCEPTION 'Số dư ví không đủ để thanh toán đơn hàng. Còn thiếu % VNĐ', NEW.total_price - wallet_balance;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Hàm để khôi phục số lượng tồn kho khi xóa chi tiết đơn hàng
CREATE OR REPLACE FUNCTION restore_inventory(product_id INT, quantity INT)
RETURNS VOID AS $$
BEGIN
    UPDATE product
    SET inventory = inventory + quantity
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- Hàm để cập nhật tổng giá trị đơn hàng khi có thay đổi trong bảng order_detail
CREATE OR REPLACE FUNCTION update_order_total_price()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "order"
    SET total_price = calculate_total_price(NEW.orderid)
    WHERE id = NEW.orderid;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Hàm để cập nhật tổng giá trị đơn hàng khi xóa chi tiết đơn hàng
CREATE OR REPLACE FUNCTION update_order_total_price_after_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "order"
    SET total_price = calculate_total_price(OLD.orderid)
    WHERE id = OLD.orderid;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Hàm để khôi phục số lượng tồn kho khi xóa chi tiết đơn hàng
CREATE OR REPLACE FUNCTION restore_product_inventory()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM restore_inventory(OLD.productid, OLD.quantity);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Hàm để cập nhật số dư ví của khách hàng sau khi tạo đơn hàng mới
CREATE OR REPLACE FUNCTION deduct_wallet_after_order()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_customer_wallet(NEW.customerid, NEW.total_price);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Hàm để cập nhật số dư ví của khách hàng sau khi hủy đơn hàng
CREATE OR REPLACE FUNCTION restore_wallet_after_order_cancel()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_customer_wallet(OLD.customerid, -OLD.total_price);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Hàm kiểm tra tồn kho trước khi thêm order_detail
CREATE OR REPLACE FUNCTION check_inventory()
RETURNS TRIGGER AS $$
DECLARE
    product_name VARCHAR;
BEGIN
    -- Lấy tên sản phẩm từ bảng product
    SELECT name INTO product_name
    FROM product
    WHERE id = NEW.productid;

    -- Kiểm tra tồn kho và raise exception nếu không đủ
    IF (SELECT inventory FROM product WHERE id = NEW.productid) < NEW.quantity THEN
        RAISE EXCEPTION 'Không đủ tồn kho cho sản phẩm %', product_name;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--Trigger để cập nhật inventory khi có một đơn hàng mới được thêm
CREATE OR REPLACE FUNCTION update_inventory_trigger()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_inventory(NEW.productid, NEW.quantity);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_inventory
AFTER INSERT ON order_detail
FOR EACH ROW
EXECUTE FUNCTION update_inventory_trigger();

-- Trigger để kiểm tra số lượng tồn kho trước khi thêm order_detail
CREATE TRIGGER trg_check_inventory
BEFORE INSERT OR UPDATE ON order_detail
FOR EACH ROW
EXECUTE FUNCTION check_inventory();

-- Trigger để khôi phục số lượng tồn kho khi xóa chi tiết đơn hàng
CREATE TRIGGER trg_restore_product_inventory
AFTER DELETE ON order_detail
FOR EACH ROW
EXECUTE FUNCTION restore_product_inventory();

-- Trigger để cập nhật tổng giá trị đơn hàng khi có thay đổi trong bảng order_detail
CREATE TRIGGER trg_update_order_total_price
AFTER INSERT OR UPDATE ON order_detail
FOR EACH ROW
EXECUTE FUNCTION update_order_total_price();

-- Trigger để cập nhật tổng giá trị đơn hàng khi xóa chi tiết đơn hàng
CREATE TRIGGER trg_update_order_total_price_after_delete
AFTER DELETE ON order_detail
FOR EACH ROW
EXECUTE FUNCTION update_order_total_price_after_delete();

-- Trigger để kiểm tra số dư ví trước khi tạo đơn hàng mới
CREATE TRIGGER trg_check_wallet_balance
BEFORE INSERT ON "order"
FOR EACH ROW
EXECUTE FUNCTION check_wallet_balance();

-- Trigger để cập nhật số dư ví của khách hàng sau khi tạo đơn hàng mới
CREATE TRIGGER trg_deduct_wallet_after_order
AFTER INSERT ON "order"
FOR EACH ROW
EXECUTE FUNCTION deduct_wallet_after_order();

-- Trigger để cập nhật số dư ví của khách hàng sau khi hủy đơn hàng
CREATE TRIGGER trg_restore_wallet_after_order_cancel
AFTER DELETE ON "order"
FOR EACH ROW
EXECUTE FUNCTION restore_wallet_after_order_cancel();

-- Chèn dữ liệu mẫu vào bảng customer
INSERT INTO customer (wallet, phone, name, address, password) VALUES
(5000000, '1234567890', 'Nguyen Van A', '54 Nguyen Chi Thanh, Dong Da, Ha Noi', '123456'),
(3000500, '1234567891', 'Tran Thi B', '273 An Duong Vuong, Quan 5, TP. Ho Chi Minh', '123456'),
(1500750, '1234567892', 'Le Van C', '92 Le Thanh Nghi, Hai Ba Trung, Ha Noi', '123456');

-- Chèn dữ liệu mẫu vào bảng admin
INSERT INTO admin (phone, password, name) VALUES
('0987654321', 'pass123', 'Admin One'),
('0987654322', 'pass456', 'Admin Two');

-- Chèn dữ liệu mẫu vào bảng product
INSERT INTO product (name, price, category, inventory, description) VALUES
('Phin Sữa Tươi Bánh Flan', 49000, 'Cà Phê Highlight', 200, 'Tỉnh tức thì cùng cà phê Robusta pha phin đậm đà và bánh flan núng nính. Uống là tỉnh, ăn là dính, xứng đáng là highlight trong ngày của bạn'),
('Trà Xanh Espresso Marble', 49000, 'Cà Phê Highlight', 200, 'Cho ngày thêm tươi, tỉnh, êm, mượt với Trà Xanh Espresso Marble. Đây là sự mai mối bất ngờ giữa trà xanh Tây Bắc vị mộc và cà phê Arabica Đà Lạt. Muốn ngày thêm chút highlight, nhớ tìm đến sự bất ngờ này bạn nhé!'),
('Đường Đen Sữa Đá', 45000, 'Cà Phê Việt Nam', 200, 'Nếu chuộng vị cà phê đậm đà, bùng nổ và thích vị đường đen ngọt thơm, Đường Đen Sữa Đá đích thị là thức uống dành cho bạn. Không chỉ giúp bạn tỉnh táo buổi sáng, Đường Đen Sữa Đá còn hấp dẫn đến ngụm cuối cùng bởi thạch cà phê giòn dai, nhai cực cuốn. - Khuấy đều trước khi sử dụng'),
('The Coffee House Sữa Đá', 39000, 'Cà Phê Việt Nam', 200, 'Thức uống giúp tỉnh táo tức thì để bắt đầu ngày mới thật hứng khởi. Không đắng khét như cà phê truyền thống, The Coffee House Sữa Đá mang hương vị hài hoà đầy lôi cuốn. Là sự đậm đà của 100% cà phê Arabica Cầu Đất rang vừa tới, biến tấu tinh tế với sữa đặc và kem sữa ngọt ngào cực quyến rũ. Càng hấp dẫn hơn với topping thạch 100% cà phê nguyên chất giúp giữ trọn vị ngon đến ngụm cuối cùng.'),
('Cà Phê Sữa Đá', 29000, 'Cà Phê Việt Nam', 200, 'Cà phê Đắk Lắk nguyên chất được pha phin truyền thống kết hợp với sữa đặc tạo nên hương vị đậm đà, hài hòa giữa vị ngọt đầu lưỡi và vị đắng thanh thoát nơi hậu vị.'),
('Cà Phê Sữa Nóng', 39000, 'Cà Phê Việt Nam', 200, 'Cà phê được pha phin truyền thống kết hợp với sữa đặc tạo nên hương vị đậm đà, hài hòa giữa vị ngọt đầu lưỡi và vị đắng thanh thoát nơi hậu vị.'),
('Bạc Sỉu', 29000, 'Cà Phê Việt Nam', 200, 'Bạc sỉu chính là "Ly sữa trắng kèm một chút cà phê". Thức uống này rất phù hợp những ai vừa muốn trải nghiệm chút vị đắng của cà phê vừa muốn thưởng thức vị ngọt béo ngậy từ sữa.'),
('Bạc Sỉu Nóng', 39000, 'Cà Phê Việt Nam', 200, 'Bạc sỉu chính là "Ly sữa trắng kèm một chút cà phê". Thức uống này rất phù hợp những ai vừa muốn trải nghiệm chút vị đắng của cà phê vừa muốn thưởng thức vị ngọt béo ngậy từ sữa.'),
('Cà Phê Đen Đá', 29000, 'Cà Phê Việt Nam', 200, 'Không ngọt ngào như Bạc sỉu hay Cà phê sữa, Cà phê đen mang trong mình phong vị trầm lắng, thi vị hơn. Người ta thường phải ngồi rất lâu mới cảm nhận được hết hương thơm ngào ngạt, phảng phất mùi cacao và cái đắng mượt mà trôi tuột xuống vòm họng.'),
('Cà Phê Đen Nóng', 39000, 'Cà Phê Việt Nam', 200, 'Không ngọt ngào như Bạc sỉu hay Cà phê sữa, Cà phê đen mang trong mình phong vị trầm lắng, thi vị hơn. Người ta thường phải ngồi rất lâu mới cảm nhận được hết hương thơm ngào ngạt, phảng phất mùi cacao và cái đắng mượt mà trôi tuột xuống vòm họng.'),
('Cà Phê Sữa Đá Chai Fresh 250ML', 75000, 'Cà Phê Việt Nam', 200, 'Vẫn là hương vị cà phê sữa đậm đà quen thuộc của The Coffee House nhưng khoác lên mình một chiếc áo mới tiện lợi hơn, tiết kiệm hơn phù hợp với bình thường mới, giúp bạn tận hưởng một ngày dài trọn vẹn. *Sản phẩm dùng ngon nhất trong ngày. *Sản phẩm mặc định mức đường và không đá.'),
('Đường Đen Marble Latte', 55000, 'Cà Phê Máy', 200, 'Đường Đen Marble Latte êm dịu cực hấp dẫn bởi vị cà phê đắng nhẹ hoà quyện cùng vị đường đen ngọt thơm và sữa tươi béo mịn. Sự kết hợp đầy mới mẻ của cà phê và đường đen cũng tạo nên diện mạo phân tầng đẹp mắt. Đây là lựa chọn đáng thử để bạn khởi đầu ngày mới đầy hứng khởi. - Khuấy đều trước khi sử dụng'),
('Caramel Macchiato Đá', 55000, 'Cà Phê Máy', 200, 'Khuấy đều trước khi sử dụng Caramel Macchiato sẽ mang đến một sự ngạc nhiên thú vị khi vị thơm béo của bọt sữa, sữa tươi, vị đắng thanh thoát của cà phê Espresso hảo hạng và vị ngọt đậm của sốt caramel được gói gọn trong một tách cà phê.'),
('Caramel Macchiato Nóng', 55000, 'Cà Phê Máy', 200, 'Caramel Macchiato sẽ mang đến một sự ngạc nhiên thú vị khi vị thơm béo của bọt sữa, sữa tươi, vị đắng thanh thoát của cà phê Espresso hảo hạng và vị ngọt đậm của sốt caramel được gói gọn trong một tách cà phê.'),
('Latte Đá', 55000, 'Cà Phê Máy', 200, 'Một sự kết hợp tinh tế giữa vị đắng cà phê Espresso nguyên chất hòa quyện cùng vị sữa nóng ngọt ngào, bên trên là một lớp kem mỏng nhẹ tạo nên một tách cà phê hoàn hảo về hương vị lẫn nhãn quan.'),
('Latte Nóng', 55000, 'Cà Phê Máy', 200, 'Một sự kết hợp tinh tế giữa vị đắng cà phê Espresso nguyên chất hòa quyện cùng vị sữa nóng ngọt ngào, bên trên là một lớp kem mỏng nhẹ tạo nên một tách cà phê hoàn hảo về hương vị lẫn nhãn quan.'),
('Americano Đá', 45000, 'Cà Phê Máy', 200, 'Americano được pha chế bằng cách pha thêm nước với tỷ lệ nhất định vào tách cà phê Espresso, từ đó mang lại hương vị nhẹ nhàng và giữ trọn được mùi hương cà phê đặc trưng.'),
('Cappuccino Nóng', 55000, 'Cà Phê Máy', 200, 'Capuchino là thức uống hòa quyện giữa hương thơm của sữa, vị béo của bọt kem cùng vị đậm đà từ cà phê Espresso. Tất cả tạo nên một hương vị đặc biệt, một chút nhẹ nhàng, trầm lắng và tinh tế.'),
('Espresso Đá', 49000, 'Cà Phê Máy', 200, 'Một tách Espresso nguyên bản được bắt đầu bởi những hạt Arabica chất lượng, phối trộn với tỉ lệ cân đối hạt Robusta, cho ra vị ngọt caramel, vị chua dịu và sánh đặc.'),
('Espresso Nóng', 45000, 'Cà Phê Máy', 200, 'Một tách Espresso nguyên bản được bắt đầu bởi những hạt Arabica chất lượng, phối trộn với tỉ lệ cân đối hạt Robusta, cho ra vị ngọt caramel, vị chua dịu và sánh đặc.'),
('Cold Brew Phúc Bồn Tử', 49000, 'Cold Brew', 200, 'Vị chua ngọt của trái phúc bồn tử, làm dậy lên hương vị trái cây tự nhiên vốn sẵn có trong hạt cà phê, hòa quyện thêm vị đăng đắng, ngọt dịu nhẹ nhàng của Cold Brew 100% hạt Arabica Cầu Đất để mang đến một cách thưởng thức cà phê hoàn toàn mới, vừa thơm lừng hương cà phê quen thuộc, vừa nhẹ nhàng và thanh mát bởi hương trái cây đầy thú vị.'),
('Cold Brew Sữa Tươi', 49000, 'Cold Brew', 200, 'Thanh mát và cân bằng với hương vị cà phê nguyên bản 100% Arabica Cầu Đất cùng sữa tươi thơm béo cho từng ngụm tròn vị, hấp dẫn.'),
('Cold Brew Truyền Thống', 45000, 'Cold Brew', 200, 'Tại The Coffee House, Cold Brew được ủ và phục vụ mỗi ngày từ 100% hạt Arabica Cầu Đất với hương gỗ thông, hạt dẻ, nốt sô-cô-la đặc trưng, thoang thoảng hương khói nhẹ giúp Cold Brew giữ nguyên vị tươi mới.'),
('Oolong Tứ Quý Kim Quất Trân Châu', 49000, 'Trà trái cây', 200, 'Đậm hương trà, sảng khoái du xuân cùng Oolong Tứ Quý Kim Quất Trân Châu. Vị nước cốt kim quất tươi chua ngọt, thêm trân châu giòn dai.'),
('Oolong Tứ Quý Vải', 49000, 'Trà trái cây', 200, 'Đậm hương trà, thanh mát sắc xuân với Oolong Tứ Quý Vải. Cảm nhận hương hoa đầu mùa, hòa quyện cùng vị vải chín mọng căng tràn sức sống.'),
('Trà Đào Cam Sả - Đá', 49000, 'Trà trái cây', 200, 'Vị thanh ngọt của đào, vị chua dịu của Cam Vàng nguyên vỏ, vị chát của trà đen tươi được ủ mới mỗi 4 tiếng, cùng hương thơm nồng đặc trưng của sả chính là điểm sáng làm nên sức hấp dẫn của thức uống này.'),
('Trà Đào Cam Sả - Nóng', 59000, 'Trà trái cây', 200, 'Vị thanh ngọt của đào, vị chua dịu của Cam Vàng nguyên vỏ, vị chát của trà đen tươi được ủ mới mỗi 4 tiếng, cùng hương thơm nồng đặc trưng của sả chính là điểm sáng làm nên sức hấp dẫn của thức uống này.'),
('Trà Hạt Sen - Đá', 49000, 'Trà trái cây', 200, 'Nền trà oolong hảo hạng kết hợp cùng hạt sen tươi, bùi bùi và lớp foam cheese béo ngậy. Trà hạt sen là thức uống thanh mát, nhẹ nhàng phù hợp cho cả buổi sáng và chiều tối.'),
('Trà Hạt Sen - Nóng', 59000, 'Trà trái cây', 200, 'Nền trà oolong hảo hạng kết hợp cùng hạt sen tươi, bùi bùi thơm ngon. Trà hạt sen là thức uống thanh mát, nhẹ nhàng phù hợp cho cả buổi sáng và chiều tối.'),
('Trà Đào Cam Sả Chai Fresh 500ML', 105000, 'Trà trái cây', 200, 'Với phiên bản chai fresh 500ml, thức uống "best seller" đỉnh cao mang một diện mạo tươi mới, tiện lợi, phù hợp với bình thường mới và vẫn giữ nguyên vị thanh ngọt của đào, vị chua dịu của cam vàng nguyên vỏ và vị trà đen thơm lừng ly Trà đào cam sả nguyên bản. *Sản phẩm dùng ngon nhất trong ngày. *Sản phẩm mặc định mức đường và không đá.'),
('Hồng Trà Sữa Trân Châu', 55000, 'Trà sữa Macchiato', 200, 'Thêm chút ngọt ngào cho ngày mới với hồng trà nguyên lá, sữa thơm ngậy được cân chỉnh với tỉ lệ hoàn hảo, cùng trân châu trắng dai giòn có sẵn để bạn tận hưởng từng ngụm trà sữa ngọt ngào thơm ngậy thiệt đã.'),
('Trà Đen Macchiato', 55000, 'Trà sữa Macchiato', 200, 'Trà đen được ủ mới mỗi ngày, giữ nguyên được vị chát mạnh mẽ đặc trưng của lá trà, phủ bên trên là lớp Macchiato "homemade" bồng bềnh quyến rũ vị phô mai mặn mặn mà béo béo.'),
('Hồng Trà Sữa Nóng', 55000, 'Trà sữa Macchiato', 200, 'Từng ngụm trà chuẩn gu ấm áp, đậm đà beo béo bởi lớp sữa tươi chân ái hoà quyện. Trà đen nguyên lá âm ấm dịu nhẹ, quyện cùng lớp sữa thơm béo khó lẫn - hương vị ấm áp chuẩn gu trà, cho từng ngụm nhẹ nhàng, ngọt dịu lưu luyến mãi nơi cuống họng.'),
('Trà sữa Oolong Nướng Trân Châu', 55000, 'Trà sữa Macchiato', 200, 'Hương vị chân ái đúng gu đậm đà với trà oolong được “sao” (nướng) lâu hơn cho hương vị đậm đà, hòa quyện với sữa thơm béo mang đến cảm giác mát lạnh, lưu luyến vị trà sữa đậm đà nơi vòm họng.'),
('Trà sữa Oolong Nướng (Nóng)', 55000, 'Trà sữa Macchiato', 200, 'Đậm đà chuẩn gu và ấm nóng - bởi lớp trà oolong nướng đậm vị hoà cùng lớp sữa thơm béo. Hương vị chân ái đúng gu đậm đà - trà oolong được "sao" (nướng) lâu hơn cho vị đậm đà, hoà quyện với sữa thơm ngậy. Cho từng ngụm ấm áp, lưu luyến vị trà sữa đậm đà mãi nơi cuống họng.'),
('Trà Sữa Oolong Nướng Trân Châu Chai Fresh 500ML', 95000, 'Trà sữa Macchiato', 200, 'Phiên bản chai fresh 500ml mới, The Coffee House tin rằng với diện mạo mới: tiện lợi và phù hợp với bình thường mới này, các tín đồ trà sữa sẽ được thưởng thức hương vị đậm đà, hòa quyện với sữa thơm béo mang đến cảm giác mát lạnh ở bất cứ nơi đâu. *Sản phẩm dùng ngon nhất trong ngày. *Sản phẩm mặc định mức đường và không đá.'),
('CloudFee Hạnh Nhân Nướng', 49000, 'CloudFee', 200, 'Vị đắng nhẹ từ cà phê phin truyền thống kết hợp Espresso Ý, lẫn chút ngọt ngào của kem sữa và lớp foam trứng cacao, nhấn thêm hạnh nhân nướng thơm bùi, kèm topping thạch cà phê dai giòn mê ly. Tất cả cùng quyện hoà trong một thức uống làm vị giác "thức giấc", thơm ngon hết nấc.'),
('CloudFee Caramel', 49000, 'CloudFee', 200, 'Ngon khó cưỡng bởi xíu đắng nhẹ từ cà phê phin truyền thống pha trộn với Espresso lừng danh nước Ý, quyện vị kem sữa và caramel ngọt ngọt, thêm lớp foam trứng cacao bồng bềnh béo mịn, kèm topping thạch cà phê dai giòn nhai cực cuốn. Một thức uống "điểm mười" cho cả ngày tươi không cần tưới.'),
('CloudFee Hà Nội', 49000, 'CloudFee', 200, 'Khiến bạn mê mẩn ngay ngụm đầu tiên bởi vị đắng nhẹ của cà phê phin truyền thống kết hợp Espresso Ý, quyện hòa cùng chút ngọt ngào của kem sữa, và thơm béo từ foam trứng cacao. Nhấp một ngụm rồi nhai cùng thạch cà phê dai dai giòn giòn, đúng chuẩn "ngon quên lối về". CloudFee Classic là món đậm vị cà phê nhất trong bộ sưu tập nhưng không quá đắng, ngậy nhưng không hề ngấy.'),
('CloudTea Oolong Berry', 69000, 'CloudTea Mochi', 200, 'Cắn một cái, chua chua ngọt ngọt ngon đến từng tế bào với chiếc Mochi Kem Phúc Bồn Tử! Hút một ngụm, mê luôn Trà Oolong Sữa dịu êm quyện vị dâu, cùng lớp foam phô mai phủ vụn bánh quy phô mai mằn mặn. Món không thể thiếu đá, để ngoại hình và chất lượng được đảm bảo.'),
('CloudTea Trà Xanh Tây Bắc', 69000, 'CloudTea Mochi', 200, 'Không thể rời môi với Mochi Kem Matcha dẻo mịn, núng nính. Trà Xanh Tây Bắc vị mộc hoà quyện sữa tươi, foam phô mai beo béo và vụn bánh quy giòn tan, là lựa chọn đậm không khí lễ hội. Món không thể thiếu đá, để ngoại hình và chất lượng được đảm bảo.'),
('Hi-Tea Đào Kombucha', 59000, 'Hi-Tea Trà', 200, 'Trà hoa Hibiscus 0% caffeine chua nhẹ, kết hợp cùng trà lên men Kombucha hoàn toàn tự nhiên và Đào thanh mát tạo nên Hi-Tea Đào Kombucha chua ngọt cực cuốn. Đặc biệt Kombucha Detox giàu axit hữu cơ, Đào nhiều chất xơ giúp thanh lọc cơ thể và hỗ trợ giảm cân hiệu quả. Lưu ý: Khuấy đều trước khi dùng'),
('Hi-Tea Yuzu Kombucha', 59000, 'Hi-Tea Trà', 200, 'Trà hoa Hibiscus 0% caffeine thanh mát, hòa quyện cùng trà lên men Kombucha 100% tự nhiên và mứt Yuzu Marmalade (quýt Nhật) mang đến hương vị chua chua lạ miệng. Đặc biệt, Hi-Tea Yuzu Kombucha cực hợp cho team thích detox, muốn sáng da nhờ Kombucha Detox nhiều chất chống oxy hoá cùng Yuzu giàu vitamin C. Lưu ý: Khuấy đều trước khi dùng'),
('Hi-Tea Yuzu Trân Châu', 49000, 'Hi-Tea Trà', 200, 'Không chỉ nổi bật với sắc đỏ đặc trưng từ trà hoa Hibiscus, Hi-Tea Yuzu còn gây ấn tượng với topping Yuzu (quýt Nhật) lạ miệng, kết hợp cùng trân châu trắng dai giòn sần sật, nhai vui vui.'),
('Trà Xanh Latte', 45000, 'Trà Xanh Tây Bắc', 200, 'Không cần đến Tây Bắc mới cảm nhận được sự trong trẻo của núi rừng, khi Trà Xanh Latte từ Nhà được chắt lọc từ những búp trà xanh mướt, ủ mình trong sương sớm. Trà xanh Tây Bắc vị thanh, chát nhẹ hoà cùng sữa tươi nguyên kem ngọt béo tạo nên hương vị dễ uống, dễ yêu. Đây là thức uống healthy, giúp bạn tỉnh táo một cách êm mượt, xoa dịu những căng thẳng.'),
('Trà Xanh Latte (Nóng)', 45000, 'Trà Xanh Tây Bắc', 200, 'Trà Xanh Latte (Nóng) là phiên bản rõ vị trà nhất. Nhấp một ngụm, bạn chạm ngay vị trà xanh Tây Bắc chát nhẹ hoà cùng sữa nguyên kem thơm béo, đọng lại hậu vị ngọt ngào, êm dịu. Không chỉ là thức uống tốt cho sức khoẻ, Trà Xanh Latte (Nóng) còn là cái ôm ấm áp của đồng bào Tây Bắc gửi cho người miền xuôi.'),
('Trà Xanh Đường Đen', 55000, 'Trà Xanh Tây Bắc', 200, 'Trà Xanh Đường Đen với hiệu ứng phân tầng đẹp mắt, như phác hoạ núi đồi Tây Bắc bảng lảng trong sương mây, thấp thoáng những nương chè xanh ngát. Từng ngụm là sự hài hoà từ trà xanh đậm đà, đường đen ngọt ngào, sữa tươi thơm béo. Khuấy đều trước khi dùng, để thưởng thức đúng vị'),
('Frosty Trà Xanh', 59000, 'Trà Xanh Tây Bắc', 200, 'Đá Xay Frosty Trà Xanh như lời mời mộc mạc, ghé thăm Tây Bắc vào những ngày tiết trời se lạnh, núi đèo mây phủ. Vị chát dịu, ngọt thanh của trà xanh Tây Bắc kết hợp đá xay sánh mịn, whipping cream bồng bềnh và bột trà xanh trên cùng thêm đậm vị. Đây không chỉ là thức uống mát lạnh bật mood, mà còn tốt cho sức khoẻ nhờ giàu vitamin và các chất chống oxy hoá.'),
('Chocolate Nóng', 55000, 'Chocolate', 200, 'Bột chocolate nguyên chất hoà cùng sữa tươi béo ngậy. Vị ngọt tự nhiên, không gắt cổ, để lại một chút đắng nhẹ, cay cay trên đầu lưỡi.'),
('Chocolate Đá', 55000, 'Chocolate', 200, 'Bột chocolate nguyên chất hoà cùng sữa tươi béo ngậy, ấm nóng. Vị ngọt tự nhiên, không gắt cổ, để lại một chút đắng nhẹ, cay cay trên đầu lưỡi.'),
('Smoothie Xoài Nhiệt Đới Granola', 65000, 'Đá xay Frosty', 200, 'Hương vị trái cây tươi mát gói trọn trong ly Smoothie Xoài Nhiệt Đới Granola. Xoài ngọt đậm quyện cùng sữa chua sánh mịn. Nhân đôi healthy với ngũ cốc Granola và topping hạt nổ sữa chua vui miệng.'),
('Smoothie Phúc Bồn Tử Granola', 65000, 'Đá xay Frosty', 200, 'Lấy đà vào hạ cùng Smoothie Phúc Bồn Tử Granola chua chua, ngọt ngọt. Hút một hơi mát lành với sữa chua sánh mịn, ngũ cốc Granola dinh dưỡng và hạt nổ sữa chua. Hạ gần bên ta!'),
('Frosty Phin-Gato', 55000, 'Đá xay Frosty', 200, 'Đá Xay Frosty Phin-Gato là lựa chọn không thể bỏ lỡ cho tín đồ cà phê. Cà phê nguyên chất pha phin truyền thống, thơm đậm đà, đắng mượt mà, quyện cùng kem sữa béo ngậy và đá xay mát lạnh. Nhân đôi vị cà phê nhờ có thêm thạch cà phê đậm đà, giòn dai. Thức uống khơi ngay sự tỉnh táo tức thì. Lưu ý: Khuấy đều phần đá xay trước khi dùng'),
('Frosty Cà Phê Đường Đen', 59000, 'Đá xay Frosty', 200, 'Đá Xay Frosty Cà Phê Đường Đen mát lạnh, sảng khoái ngay từ ngụm đầu tiên nhờ sự kết hợp vượt chuẩn vị quen giữa Espresso đậm đà và Đường Đen ngọt thơm. Đặc biệt, whipping cream beo béo cùng thạch cà phê giòn dai, đậm vị nhân đôi sự hấp dẫn, khơi bừng sự hứng khởi trong tích tắc.'),
('Frosty Caramel Arabica', 59000, 'Đá xay Frosty', 200, 'Caramel ngọt thơm quyện cùng cà phê Arabica Cầu Đất đượm hương gỗ thông, hạt dẻ và nốt sô cô la đặc trưng tạo nên Đá Xay Frosty Caramel Arabica độc đáo chỉ có tại Nhà. Cực cuốn với lớp whipping cream béo mịn, thêm thạch cà phê giòn ngon bắt miệng.'),
('Frosty Bánh Kem Dâu', 59000, 'Đá xay Frosty', 200, 'Bồng bềnh như một đám mây, Đá Xay Frosty Bánh Kem Dâu vừa ngon mắt vừa chiều vị giác bằng sự ngọt ngào. Bắt đầu bằng cái chạm môi với lớp kem whipping cream, cảm nhận ngay vị beo béo lẫn sốt dâu thơm lừng. Sau đó, hút một ngụm là cuốn khó cưỡng bởi đá xay mát lạnh quyện cùng sốt dâu ngọt dịu. Lưu ý: Khuấy đều phần đá xay trước khi dùng'),
('Frosty Choco Chip', 59000, 'Đá xay Frosty', 200, 'Đá Xay Frosty Choco Chip, thử là đã! Lớp whipping cream bồng bềnh, beo béo lại có thêm bột sô cô la và sô cô la chip trên cùng. Gấp đôi vị ngon với sô cô la thật xay với đá sánh mịn, đậm đà đến tận ngụm cuối cùng.'),
('Bánh Mì Que Pate', 15000, 'Bánh mặn', 200, 'Vỏ bánh mì giòn tan, kết hợp với lớp nhân pate béo béo đậm đà sẽ là lựa chọn lý tưởng nhẹ nhàng để lấp đầy chiếc bụng đói , cho 1 bữa sáng - trưa - chiều - tối của bạn thêm phần thú vị.'),
('Bánh Mì Que Pate Cay', 15000, 'Bánh mặn', 200, 'Vỏ bánh mì giòn tan, kết hợp với lớp nhân pate béo béo đậm đà và 1 chút cay cay sẽ là lựa chọn lý tưởng nhẹ nhàng để lấp đầy chiếc bụng đói , cho 1 bữa sáng - trưa - chiều - tối của bạn thêm phần thú vị.'),
('Bánh Mì VN Thịt Nguội', 39000, 'Bánh mặn', 200, 'Gói gọn trong ổ bánh mì Việt Nam là từng lớp chả, từng lớp jambon hòa quyện cùng bơ và pate thơm lừng, thêm dưa rau cho bữa sáng đầy năng lượng. *Phần bánh sẽ ngon và đậm đà nhất khi kèm pate. Để đảm bảo hương vị được trọn vẹn, Nhà mong bạn thông cảm vì không thể thay đổi định lượng pate.'),
('Croissant trứng muối', 39000, 'Bánh mặn', 200, 'Croissant trứng muối thơm lừng, bên ngoài vỏ bánh giòn hấp dẫn bên trong trứng muối vị ngon khó cưỡng.'),
('Butter Croissant Sữa Đặc', 35000, 'Bánh mặn', 200, 'Bánh Butter Croissant bạn đã yêu, nay yêu không lối thoát khi được chấm cùng sữa đặc. Thơm bơ mịn sữa, ngọt ngào lòng nhau!'),
('Chà Bông Phô Mai', 39000, 'Bánh mặn', 200, 'Chiếc bánh với lớp phô mai vàng sánh mịn bên trong, được bọc ngoài lớp vỏ xốp mềm thơm lừng. Thêm lớp chà bông mằn mặn hấp dẫn bên trên.'),
('Mochi Kem Phúc Bồn Tử', 19000, 'Bánh ngọt', 200, 'Bao bọc bởi lớp vỏ Mochi dẻo thơm, bên trong là lớp kem lạnh cùng nhân phúc bồn tử ngọt ngào. Gọi 1 chiếc Mochi cho ngày thật tươi mát. Sản phẩm phải bảo quán mát và dùng ngon nhất trong 2h sau khi nhận hàng.'),
('Mochi Kem Việt Quất', 19000, 'Bánh ngọt', 200, 'Bao bọc bởi lớp vỏ Mochi dẻo thơm, bên trong là lớp kem lạnh cùng nhân việt quất đặc trưng thơm thơm, ngọt dịu. Gọi 1 chiếc Mochi cho ngày thật tươi mát. Sản phẩm phải bảo quán mát và dùng ngon nhất trong 2h sau khi nhận hàng.'),
('Mochi Kem Dừa Dứa', 19000, 'Bánh ngọt', 200, 'Bao bọc bởi lớp vỏ Mochi dẻo thơm, bên trong là lớp kem lạnh cùng nhân dừa dứa thơm lừng lạ miệng. Gọi 1 chiếc Mochi cho ngày thật tươi mát. Sản phẩm phải bảo quán mát và dùng ngon nhất trong 2h sau khi nhận hàng.'),
('Mochi Kem Chocolate', 19000, 'Bánh ngọt', 200, 'Bao bọc bởi lớp vỏ Mochi dẻo thơm, bên trong là lớp kem lạnh cùng nhân chocolate độc đáo. Gọi 1 chiếc Mochi cho ngày thật tươi mát. Sản phẩm phải bảo quán mát và dùng ngon nhất trong 2h sau khi nhận hàng.'),
('Mochi Kem Matcha', 19000, 'Bánh ngọt', 200, 'Bao bọc bởi lớp vỏ Mochi dẻo thơm, bên trong là lớp kem lạnh cùng nhân trà xanh đậm vị. Gọi 1 chiếc Mochi cho ngày thật tươi mát. Sản phẩm phải bảo quán mát và dùng ngon nhất trong 2h sau khi nhận hàng.'),
('Mochi Kem Xoài', 19000, 'Bánh ngọt', 200, 'Bao bọc bởi lớp vỏ Mochi dẻo thơm, bên trong là lớp kem lạnh cùng nhân xoài chua chua ngọt ngọt. Gọi 1 chiếc Mochi cho ngày thật tươi mát. Sản phẩm phải bảo quán mát và dùng ngon nhất trong 2h sau khi nhận hàng.'),
('Mousse Tiramisu', 35000, 'Bánh ngọt', 200, 'Hương vị dễ ghiền được tạo nên bởi chút đắng nhẹ của cà phê, lớp kem trứng béo ngọt dịu hấp dẫn'),
('Mousse Gấu Chocolate', 39000, 'Bánh ngọt', 200, 'Với vẻ ngoài đáng yêu và hương vị ngọt ngào, thơm béo nhất định bạn phải thử ít nhất 1 lần.'),
('Butter Croissant', 29000, 'Bánh Pastry', 200, 'Cắn một miếng, vỏ bánh ngàn lớp giòn thơm bơ béo, rồi mịn tan trong miệng. Cực dính khi nhâm nhi Butter Croissant với cà phê hoặc chấm cùng các món nước có foam trứng của Nhà'),
('Choco Croffle', 39000, 'Bánh Pastry', 200, 'Lạ mắt, bắt vị với chiếc bánh Croffle được làm từ cốt bánh Croissant nướng trong khuôn Waffle tổ ong. Trong mềm mịn, ngoài giòn thơm, thêm topping sô cô la tan chảy, ăn là yêu!'),
('Pate Chaud', 39000, 'Bánh Pastry', 200, 'Ngon nức lòng cùng nhân patê và thịt heo cuộn mình trong vỏ bánh ngàn lớp thơm bơ, giòn rụm.'),
('Cà Phê Đen Đá Túi (30 gói x 16g)', 116000, 'Cà phê tại nhà', 200, 'à Phê Đen Đá hoà tan The Coffee House với 100% hạt cà phê Robusta mang đến hương vị mạnh cực bốc, đậm đắng đầy lôi cuốn, đúng gu người Việt.'),
('Cà Phê Sữa Đá Hòa Tan (10 gói x 22g)', 48000, 'Cà phê tại nhà', 200, 'Thật dễ dàng để bắt đầu ngày mới với tách cà phê sữa đá sóng sánh, thơm ngon như cà phê pha phin. Vị đắng thanh của cà phê hoà quyện với vị ngọt béo của sữa, giúp bạn luôn tỉnh táo và hứng khởi cho ngày làm việc thật hiệu quả.'),
('Cà Phê Sữa Đá Hòa Tan Túi 25x22G', 114000, 'Cà phê tại nhà', 200, 'Thật dễ dàng để bắt đầu ngày mới với tách cà phê sữa đá sóng sánh, thơm ngon như cà phê pha phin. Vị đắng thanh của cà phê hoà quyện với vị ngọt béo của sữa, giúp bạn luôn tỉnh táo và hứng khởi cho ngày làm việc thật hiệu quả.'),
('Cà Phê Hoà Tan Đậm Vị Việt (18 gói x 16 gam)', 55000, 'Cà phê tại nhà', 200, 'Bắt đầu ngày mới với tách cà phê sữa “Đậm vị Việt” mạnh mẽ sẽ giúp bạn luôn tỉnh táo và hứng khởi cho ngày làm việc thật hiệu quả.'),
('Cà Phê Sữa Đá Pack 6 Lon', 84000, 'Cà phê tại nhà', 200, 'Với thiết kế lon cao trẻ trung, hiện đại và tiện lợi, Cà phê sữa đá lon thơm ngon đậm vị của The Coffee House sẽ đồng hành cùng nhịp sống sôi nổi của tuổi trẻ và giúp bạn có được một ngày làm việc đầy hứng khởi.'),
('Thùng 24 Lon Cà Phê Sữa Đá', 336000, 'Cà phê tại nhà', 200, 'Với thiết kế lon cao trẻ trung, hiện đại và tiện lợi, Cà phê sữa đá lon thơm ngon đậm vị của The Coffee House sẽ đồng hành cùng nhịp sống sôi nổi của tuổi trẻ và giúp bạn có được một ngày làm việc đầy hứng khởi.');
